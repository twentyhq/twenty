#!/usr/bin/env python3
"""Deterministic ranker for the twenty-partner-application-triage skill.

Ranks APPLICATION-stage partners by NET-NEW value vs the current VALIDATED set:
geography and language we don't yet cover (weighted high), plus a "real Twenty
work" proof signal read from the application notes. Skill volume is deliberately
capped so generic dev shops that spray skill lists don't dominate.

Reads creds from ~/.twenty/credentials.env. Emits ranked JSON to stdout.
Run `rank.py --selftest` to verify scoring without hitting the API.

# ponytail: fixed weights + tier thresholds. Tune the WEIGHTS/THRESHOLDS dicts
# below if the ranking drifts; everything else is mechanical.
"""
import json
import os
import re
import sys
import urllib.request

WEIGHTS = {"geo": 3, "lang": 3, "scope": 1, "skill": 1, "skill_cap": 3, "proof": 6}
THRESHOLDS = {"A": 12, "B": 5}  # >=A => A; >=B => B; else C. Any proof => at least A.

# "real Twenty work" signals in the free-text notes (the high-confidence axis).
PROOF_WORKSPACE = re.compile(r"https?://[^\s]*(twenty|crm)[^\s]*", re.I)
PROOF_CUSTOMERS = re.compile(r"(customers?\s+onboarded|real implementation|clients?\s+(moving|migrat)|delivered \d|named customer)", re.I)
PROOF_MIGRATION = re.compile(r"(switch\w*|migrat\w*|moved|replac\w*|our crm|own crm|we use twenty|dogfood|managed service)", re.I)

CRED_PATH = os.path.expanduser("~/.twenty/credentials.env")


def load_creds():
    if not os.path.exists(CRED_PATH):
        sys.exit(f"Missing {CRED_PATH}. Copy the partners key from the app's "
                 ".env.prod into it (TWENTY_PARTNERS_API_URL / _API_KEY).")
    env = {}
    with open(CRED_PATH) as fh:
        for line in fh:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    url = env.get("TWENTY_PARTNERS_API_URL")
    key = env.get("TWENTY_PARTNERS_API_KEY")
    if not url or not key:
        sys.exit("credentials.env is missing TWENTY_PARTNERS_API_URL or TWENTY_PARTNERS_API_KEY.")
    return url.rstrip("/"), key


def fetch_all_partners(url, key):
    recs, after = [], None
    while True:
        path = f"{url}/rest/partners?limit=60&depth=1" + (f"&starting_after={after}" if after else "")
        req = urllib.request.Request(path, headers={"Authorization": f"Bearer {key}", "User-Agent": "Mozilla/5.0"})
        data = json.load(urllib.request.urlopen(req))
        page = data["data"]["partners"]
        recs += page
        info = data.get("pageInfo", {})
        if info.get("hasNextPage") and page:
            after = info["endCursor"]
            continue
        return recs


def tok(value):
    """Flatten any nested value into a set of lowercased non-empty string tokens."""
    out = set()
    if value is None:
        return out
    if isinstance(value, str):
        s = value.strip().lower()
        if s:
            out.add(s)
    elif isinstance(value, list):
        for item in value:
            out |= tok(item)
    elif isinstance(value, dict):
        for item in value.values():
            out |= tok(item)
    else:
        out.add(str(value).lower())
    return out


def notes_str(rec):
    v = rec.get("applicationNotes")
    if isinstance(v, str):
        return v
    return "" if v is None else json.dumps(v)


def contact(rec):
    persons = rec.get("persons") or []
    if not persons:
        return None, None, rec.get("linkedin")
    p = persons[0]
    name = p.get("name") or {}
    full = " ".join(x for x in [name.get("firstName"), name.get("lastName")] if x) or None
    email = (p.get("emails") or {}).get("primaryEmail")
    linkedin = p.get("linkedinLink") or rec.get("linkedin")
    return full, email, linkedin


def baseline(validated):
    geo, lang, scope, skill = set(), set(), set(), set()
    for r in validated:
        geo |= tok(r.get("region")) | tok(r.get("country"))
        lang |= tok(r.get("languagesSpoken"))
        scope |= tok(r.get("partnerScope"))
        skill |= tok(r.get("skills"))
    return {"geo": geo, "lang": lang, "scope": scope, "skill": skill}


def score_one(rec, base):
    new_geo = sorted((tok(rec.get("region")) | tok(rec.get("country"))) - base["geo"])
    new_lang = sorted(tok(rec.get("languagesSpoken")) - base["lang"])
    new_scope = sorted(tok(rec.get("partnerScope")) - base["scope"])
    new_skill = sorted(tok(rec.get("skills")) - base["skill"])
    notes = notes_str(rec)
    proof = {
        "workspace_url": bool(PROOF_WORKSPACE.search(notes)),
        "customers": bool(PROOF_CUSTOMERS.search(notes)),
        "migration": bool(PROOF_MIGRATION.search(notes)),
    }
    has_proof = any(proof.values())
    score = (WEIGHTS["geo"] * len(new_geo)
             + WEIGHTS["lang"] * len(new_lang)
             + WEIGHTS["scope"] * len(new_scope)
             + WEIGHTS["skill"] * min(len(new_skill), WEIGHTS["skill_cap"])
             + (WEIGHTS["proof"] if has_proof else 0))
    if has_proof or score >= THRESHOLDS["A"]:
        tier = "A"
    elif score >= THRESHOLDS["B"]:
        tier = "B"
    else:
        tier = "C"
    name, email, linkedin = contact(rec)
    return {
        "name": rec.get("name"),
        "score": score,
        "tier": tier,
        "new_geo": new_geo,
        "new_lang": new_lang,
        "new_scope": new_scope,
        "new_skills": new_skill,
        "proof": {k: v for k, v in proof.items() if v},
        "team": rec.get("typeOfTeam"),
        "contact_name": name,
        "email": email,
        "linkedin": linkedin if isinstance(linkedin, str) else (linkedin or {}).get("primaryLinkUrl") if isinstance(linkedin, dict) else None,
        "website": (rec.get("website") or {}).get("primaryLinkUrl") if isinstance(rec.get("website"), dict) else None,
        "notes": notes.strip()[:400],
    }


def rank(recs):
    validated = [r for r in recs if r.get("validationStage") == "VALIDATED"]
    apps = [r for r in recs if r.get("validationStage") == "APPLICATION"]
    # Forward-compat: once callBookedAt exists, narrow to the un-booked (the chase set).
    has_booked_field = any("callBookedAt" in r for r in recs)
    if has_booked_field:
        apps = [r for r in apps if not r.get("callBookedAt")]
    base = baseline(validated)
    ranked = sorted((score_one(r, base) for r in apps), key=lambda d: -d["score"])
    return {
        "validated_count": len(validated),
        "application_count": len(apps),
        "booking_state_wired": has_booked_field,
        "coverage": {k: sorted(v) for k, v in base.items()},
        "ranked": ranked,
    }


def selftest():
    base_recs = [{"validationStage": "VALIDATED", "country": ["france"],
                  "languagesSpoken": ["french", "english"], "partnerScope": ["development"],
                  "skills": ["react", "postgres"]}]
    apps = [
        {"validationStage": "APPLICATION", "name": "gap+proof", "country": ["germany"],
         "languagesSpoken": ["german"], "applicationNotes":
         "Live workspace https://crm.acme.de — customers onboarded: Foo GmbH"},
        {"validationStage": "APPLICATION", "name": "skill-sprayer",
         "skills": ["php", "vue", "kotlin", "swift", "laravel", "mongodb"]},
        {"validationStage": "APPLICATION", "name": "empty"},
    ]
    out = rank(base_recs + apps)["ranked"]
    order = [r["name"] for r in out]
    assert order == ["gap+proof", "skill-sprayer", "empty"], order
    assert out[0]["tier"] == "A", out[0]
    assert out[1]["score"] == WEIGHTS["skill_cap"], out[1]  # 6 new skills capped at 3
    assert out[2]["tier"] == "C", out[2]
    print("selftest ok:", order)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        selftest()
    else:
        url, key = load_creds()
        print(json.dumps(rank(fetch_all_partners(url, key)), indent=2, ensure_ascii=False))
