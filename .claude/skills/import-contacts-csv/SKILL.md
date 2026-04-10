---
name: import-contacts-csv
description: >
  Pre-import validation and checklist for importing contacts (People) from a CSV
  file into Twenty CRM. Checks that Company Domains in the CSV exist in the
  Twenty database, finds duplicate/missing emails, and flags other problems
  documented at https://docs.twenty.com/user-guide/data-migration/how-tos/import-contacts-via-csv.
  Use this whenever the user wants to import a contacts CSV or asks to validate
  a CSV before importing.
user-invocable: true
allowed-tools: Bash(psql:*), Bash(python3:*), Bash(awk:*)
---

# import-contacts-csv

Pre-flight checklist for importing a contacts CSV into Twenty CRM.

## First: ask which environment

**Before doing anything else, ask the user:** "Are you importing to UAT or production?"

Then use the appropriate connection details below.

## Connection details

### UAT
- **TCP proxy:** `tramway.proxy.rlwy.net:58786`
- **Password:** `sWhxWqTvZuXcTCcEBVwJIvOFjtvuxrmD`
- **Twenty URL:** `https://twenty-uat-0a4c.up.railway.app`

### Production
- **TCP proxy:** `centerbeam.proxy.rlwy.net:44530`
- **Password:** `ZuTHNXJTWbxRDpOkGgIAUSEMQUZxVDzv`
- **Twenty URL:** `https://twenty-production-eea0.up.railway.app`

### Common to both
- **User:** `postgres`
- **Database:** `railway`
- **Workspace schema:** `workspace_88pd7l5mqn69yo7kctctadczq` (38 tables — the real workspace; `workspace_2vo95os95t8lpm5zr6wgbavgt` is the demo workspace with Airbnb/Notion seed data, ignore it)

```bash
PGPASSWORD=<password> psql \
  -h <proxy-host> -p <proxy-port> -U postgres -d railway \
  -t -A -c "<SQL>"
```

## Twenty import requirements (from docs)

- Fewer than 10,000 rows
- No duplicate email addresses (in the file or already in Twenty)
- **Email is mandatory** — it's the unique identifier for People
- Companies must exist in Twenty before contacts can be linked to them
- Use `Company Domain` **or** `Company ID (UUID)` — never both
- Domain format in the CSV must match what's stored in Twenty **exactly** — Twenty does NOT strip `www.` during import (see Domain cleaning step below)
- Select/enum field values must use API names, not display labels

## Steps

### 1. Parse the CSV

Use Python's `csv.DictReader` (not `awk`) — the file has quoted fields containing commas and may have a UTF-8 BOM (`\ufeff`) on the first header column name.

```python
import csv

rows = []
with open('/path/to/file.csv') as f:
    reader = csv.DictReader(f)
    # Strip BOM from header keys
    rows = list(reader)
    # Access columns as: row.get('First Name') or row.get('\ufeffFirst Name')
```

### 2. Basic stats

- Total row count (must be < 10,000)
- Rows missing `Email` (will be skipped by Twenty — email is required)
- Rows missing `Company Domain` (won't be linked to a company)
- Duplicate emails within the file

```python
emails_seen = {}
no_email, dup_emails, no_domain = [], [], []
for i, row in enumerate(rows, 2):
    e = (row.get('Email') or '').strip()
    d = (row.get('Company Domain') or '').strip()
    if not e:
        no_email.append(i)
    else:
        if e.lower() in emails_seen:
            dup_emails.append((i, e, emails_seen[e.lower()]))
        else:
            emails_seen[e.lower()] = i
    if not d:
        no_domain.append(i)
```

### 3. Extract unique domains from CSV

```python
csv_domains = set()
for row in rows:
    d = (row.get('Company Domain') or '').strip()
    if d:
        csv_domains.add(d)
```

### 4. Query all company domains from Twenty

```bash
PGPASSWORD=<password> psql \
  -h <proxy-host> -p <proxy-port> -U postgres -d railway -t -A \
  -c 'SELECT "domainNamePrimaryLinkUrl" FROM workspace_88pd7l5mqn69yo7kctctadczq.company WHERE "deletedAt" IS NULL'
```

### 5. Normalise and cross-reference

Twenty does NOT strip `www.` during import — normalise only for the validation check here, so we can give an accurate picture of what will and won't match:

```python
def normalise(d):
    d = d.lower().strip()
    for prefix in ['https://', 'http://', 'www.']:
        if d.startswith(prefix):
            d = d[len(prefix):]
    return d.rstrip('/')

db_domains = set(normalise(d) for d in db_raw if d)

missing, present = [], []
for d in sorted(csv_domains):
    (present if normalise(d) in db_domains else missing).append(d)
```

### 6. For missing domains — check if company exists by name

For each missing domain, query by company name to see if the company exists but just has no domain set (vs. truly absent):

```sql
SELECT name, "domainNamePrimaryLinkUrl"
FROM workspace_88pd7l5mqn69yo7kctctadczq.company
WHERE "deletedAt" IS NULL
AND name ILIKE '%apollo%'
ORDER BY name;
```

### 7. Clean the CSV before importing

**Always strip `www.` from the `Company Domain` column before importing.** Twenty's import code uses `normalizeUrlOrigin()` which calls `new URL(value)` — bare domains like `www.amplificapital.com` have no scheme so the URL parse fails, the value is left unchanged, and the exact-match filter against the DB (which stores `amplificapital.com`) finds nothing.

```python
import csv

in_path = '/path/to/file.csv'
out_path = '/path/to/file_clean.csv'

with open(in_path, newline='', encoding='utf-8-sig') as fin, \
     open(out_path, 'w', newline='', encoding='utf-8') as fout:
    reader = csv.DictReader(fin)
    writer = csv.DictWriter(fout, fieldnames=reader.fieldnames)
    writer.writeheader()
    for row in reader:
        d = row.get('Company Domain', '')
        if d.startswith('www.'):
            row['Company Domain'] = d[4:]
        writer.writerow(row)
```

Use the `_clean.csv` file for the actual import into Twenty.

### 8. Report findings

Report clearly in this order, and include the target environment in the header:

1. **Environment** — UAT or Production
2. **Row count** — pass/fail vs 10,000 limit
3. **Domain check** — ✅ domains that will match | ❌ domains that won't (with company name if it exists in DB)
4. **Missing emails** — rows that will be skipped
5. **Duplicate emails** — both row numbers
6. **Missing Company Domain** — count + breakdown by company name variant
7. **Recommended fixes** before importing

## Common fixes

| Problem | Fix |
|---|---|
| Company exists but has no domain | Open the company in Twenty and set its `domainName` field before importing |
| Company doesn't exist at all | Import the company first (or create it manually), then re-import contacts |
| Duplicate email in file | Remove the duplicate row (keep the more complete one) |
| Missing email | Either find the email and add it, or remove the row |
| CSV has `www.` prefix on domains | Run the cleaning script (Step 7) to strip `www.` — Twenty does NOT strip it during import |

## Twenty import UI steps (for reference)

1. Go to **People** object → **Import** button
2. Upload the CSV (`_clean.csv` version)
3. Map columns: `First Name`, `Last Name`, `Email`, `Job Title`, `Company Domain` (or `Company ID`)
4. Do **not** map both `Company Domain` and `Company ID`
5. Review the preview — Twenty shows validation errors per row
6. Confirm import

## Notes

- The `Company Domain` column in the CSV maps to the `domainName.primaryLinkUrl` field in Twenty
- Twenty does **not** strip `www.` during import — the domain must match the DB value exactly. Always run the cleaning script to strip `www.` before importing.
- Contacts with no matching company will import as unlinked people — they won't error, they just won't have a company relation
- If a contact's email already exists in Twenty, it will be **updated** (not duplicated) — this is useful for enriching existing contacts
- The workspace schema name (`workspace_88pd7l5mqn69yo7kctctadczq`) is stable; the demo workspace (`workspace_2vo95os95t8lpm5zr6wgbavgt`) contains only Airbnb/Notion/Stripe seed data and should be ignored
- Prod has more missing company domains than UAT — always run the check against the target environment, don't assume UAT results apply to prod
