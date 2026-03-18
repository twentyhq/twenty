#!/usr/bin/env python3
"""
Add 16 columns to the default "All" view of TOB Subscriptions.
Idempotent: skips columns that already exist.

Usage:
  TWENTY_API_URL=http://localhost:3000 TWENTY_API_KEY=<token> python3 deploy/add-subscription-view-columns.py
"""

import json
import os
import sys
import urllib.request

API_URL = os.environ.get("TWENTY_API_URL", "https://crm.tob.sh")
API_KEY = os.environ.get("TWENTY_API_KEY")
CF_CLIENT_ID = os.environ.get("CF_ACCESS_CLIENT_ID", "")
CF_CLIENT_SECRET = os.environ.get("CF_ACCESS_CLIENT_SECRET", "")

if not API_KEY:
    print("ERROR: Set TWENTY_API_KEY before running this script.")
    sys.exit(1)

# Column spec: (fieldName, width)
COLUMNS = [
    ("name", 200),
    ("subscriptionId", 120),
    ("customerName", 150),
    ("customerEmail", 180),
    ("status", 180),
    ("accessStatus", 130),
    ("paymentStatus", 130),
    ("subscriptionType", 130),
    ("startDate", 120),
    ("endDate", 120),
    ("finalEndDate", 120),
    ("pauseDays", 100),
    ("offerDiscountTag", 150),
    ("lastTouchpoint", 130),
    ("nextActionDueDate", 130),
    ("programName", 150),
]


def gql(query, variables=None):
    body = {"query": query}
    if variables:
        body["variables"] = variables
    data = json.dumps(body).encode()
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}",
    }
    if CF_CLIENT_ID and CF_CLIENT_SECRET:
        headers["CF-Access-Client-Id"] = CF_CLIENT_ID
        headers["CF-Access-Client-Secret"] = CF_CLIENT_SECRET
    req = urllib.request.Request(f"{API_URL}/metadata", data=data, headers=headers)
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read())


def get_object_id(name_singular):
    result = gql("{ objects(paging: {first: 100}) { edges { node { id nameSingular } } } }")
    for edge in result["data"]["objects"]["edges"]:
        if edge["node"]["nameSingular"] == name_singular:
            return edge["node"]["id"]
    return None


def get_all_field_ids(object_id):
    result = gql(
        '{ object(id: "' + object_id + '") { fields(paging: {first: 200}) { edges { node { id name } } } } }'
    )
    fields = {}
    for edge in result["data"]["object"]["fields"]["edges"]:
        fields[edge["node"]["name"]] = edge["node"]["id"]
    return fields


def get_default_view_id(object_id):
    result = gql("{ getCoreViews { id name objectMetadataId } }")
    # Try "All TOB Subscriptions" first, then "All", then first match
    for view in result["data"]["getCoreViews"]:
        if view["objectMetadataId"] == object_id and view["name"] == "All TOB Subscriptions":
            return view["id"]
    for view in result["data"]["getCoreViews"]:
        if view["objectMetadataId"] == object_id and view["name"].startswith("All"):
            return view["id"]
    for view in result["data"]["getCoreViews"]:
        if view["objectMetadataId"] == object_id:
            return view["id"]
    return None


def get_existing_view_fields(view_id):
    result = gql(
        """query GetViewFields($viewId: String!) {
            getCoreViewFields(viewId: $viewId) {
                id fieldMetadataId position size isVisible
            }
        }""",
        {"viewId": view_id},
    )
    if "errors" in result:
        print(f"  Warning: Could not fetch view fields: {result['errors'][0]['message']}")
        return {}
    existing = {}
    for vf in result["data"]["getCoreViewFields"]:
        existing[vf["fieldMetadataId"]] = vf
    return existing


def create_view_field(view_id, field_metadata_id, position, size):
    result = gql(
        """mutation CreateViewField($input: CreateViewFieldInput!) {
            createCoreViewField(input: $input) { id }
        }""",
        {
            "input": {
                "viewId": view_id,
                "fieldMetadataId": field_metadata_id,
                "position": position,
                "size": size,
                "isVisible": True,
            }
        },
    )
    if "errors" in result:
        return None, result["errors"][0]["message"]
    return result["data"]["createCoreViewField"]["id"], None


def update_view_field(view_field_id, position, size, is_visible=True):
    result = gql(
        """mutation UpdateViewField($input: UpdateViewFieldInput!) {
            updateCoreViewField(input: $input) { id }
        }""",
        {
            "input": {
                "id": view_field_id,
                "update": {
                    "position": position,
                    "size": size,
                    "isVisible": is_visible,
                },
            },
        },
    )
    if "errors" in result:
        return None, result["errors"][0]["message"]
    return result["data"]["updateCoreViewField"]["id"], None


def main():
    print("=== Add Subscription List Columns ===\n")

    # 1. Find object
    sub_id = get_object_id("tobSubscription")
    if not sub_id:
        print("ERROR: tobSubscription object not found.")
        sys.exit(1)
    print(f"Object ID: {sub_id}")

    # 2. Get all field metadata IDs
    fields = get_all_field_ids(sub_id)
    print(f"Fields found: {len(fields)}")

    # 3. Find the default "All" view
    view_id = get_default_view_id(sub_id)
    if not view_id:
        print("ERROR: Default view not found.")
        sys.exit(1)
    print(f"View ID: {view_id}")

    # 4. Get existing view fields
    existing_vf = get_existing_view_fields(view_id)
    print(f"Existing view fields: {len(existing_vf)}\n")

    # 5. Add/update columns
    added = 0
    updated = 0
    skipped = 0
    missing = 0

    for position, (field_name, width) in enumerate(COLUMNS):
        field_id = fields.get(field_name)
        if not field_id:
            print(f"  [{position:2d}] {field_name:20s} — SKIP (field not found in metadata)")
            missing += 1
            continue

        if field_id in existing_vf:
            vf = existing_vf[field_id]
            if vf.get("position") == position and vf.get("size") == width and vf.get("isVisible"):
                print(f"  [{position:2d}] {field_name:20s} — OK (already correct)")
                skipped += 1
            else:
                vf_id, err = update_view_field(vf["id"], position, width)
                if err:
                    print(f"  [{position:2d}] {field_name:20s} — UPDATE ERROR: {err}")
                else:
                    print(f"  [{position:2d}] {field_name:20s} — UPDATED (pos={position}, size={width})")
                    updated += 1
        else:
            vf_id, err = create_view_field(view_id, field_id, position, width)
            if err:
                print(f"  [{position:2d}] {field_name:20s} — CREATE ERROR: {err}")
            else:
                print(f"  [{position:2d}] {field_name:20s} — CREATED (pos={position}, size={width})")
                added += 1

    # 6. Hide non-spec columns that are currently visible
    spec_field_names = {name for name, _ in COLUMNS}
    hidden = 0
    for field_id, vf in existing_vf.items():
        field_name = None
        for name, fid in fields.items():
            if fid == field_id:
                field_name = name
                break
        if field_name and field_name not in spec_field_names and vf.get("isVisible"):
            vf_id, err = update_view_field(vf["id"], 100 + hidden, vf.get("size", 150), is_visible=False)
            if not err:
                print(f"  HIDDEN: {field_name}")
                hidden += 1

    print(f"\n=== Done ===")
    print(f"Added: {added}, Updated: {updated}, Already OK: {skipped}, Missing fields: {missing}, Hidden: {hidden}")
    print("Refresh the Subscriptions list page to see the columns.")


if __name__ == "__main__":
    main()
