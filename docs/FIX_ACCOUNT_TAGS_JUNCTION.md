Fix Account Tags Junction Table Display
Problem
The accountTags field on Account shows AccountTag UUIDs instead of Tag names because the junction table configuration (junctionTargetFieldId) is not set.
Solution: Configure Junction Settings
You need to update the accountTags field metadata to include the junctionTargetFieldId setting that points to the tag field on AccountTag.
Step 1: Get Required IDs
Run this GraphQL query to get the necessary IDs:
query GetFieldIds {
  # Get Account object and its accountTags field
  objects(filter: { nameSingular: { eq: "account" } }) {
    edges {
      node {
        id
        nameSingular
        fields(filter: { name: { eq: "accountTags" } }) {
          edges {
            node {
              id
              name
              type
              settings
            }
          }
        }
      }
    }
  }
  
  # Get AccountTag object and its tag field
  accountTagObjects: objects(filter: { nameSingular: { eq: "accountTag" } }) {
    edges {
      node {
        id
        nameSingular
        fields(filter: { name: { eq: "tag" } }) {
          edges {
            node {
              id
              name
              type
            }
          }
        }
      }
    }
  }
}
Expected Response:
{
  "data": {
    "objects": {
      "edges": [{
        "node": {
          "id": "<ACCOUNT_OBJECT_ID>",
          "fields": {
            "edges": [{
              "node": {
                "id": "<ACCOUNT_TAGS_FIELD_ID>",
                "name": "accountTags",
                "settings": {
                  "relationType": "ONE_TO_MANY"
                  // Missing: junctionTargetFieldId
                }
              }
            }]
          }
        }
      }]
    },
    "accountTagObjects": {
      "edges": [{
        "node": {
          "id": "<ACCOUNT_TAG_OBJECT_ID>",
          "fields": {
            "edges": [{
              "node": {
                "id": "<TAG_FIELD_ID>",  ← THIS IS WHAT WE NEED!
                "name": "tag"
              }
            }]
          }
        }
      }]
    }
  }
}
Save these IDs:
ACCOUNT_TAGS_FIELD_ID - ID of the accountTags field on Account
TAG_FIELD_ID - ID of the tag field on AccountTag  
ACCOUNT_TAG_OBJECT_ID - ID of the AccountTag object
Step 2: Update Field Settings
Run this mutation to add the junction configuration:
mutation UpdateAccountTagsField {
  updateOneField(
    input: {
      id: "<ACCOUNT_TAGS_FIELD_ID>"
      update: {
        settings: {
          relationType: "ONE_TO_MANY"
          junctionTargetFieldId: {
            objectMetadataId: "<ACCOUNT_TAG_OBJECT_ID>"
            fieldMetadataId: "<TAG_FIELD_ID>"
          }
        }
      }
    }
  ) {
    id
    name
    settings
  }
}
Replace these placeholders:
<ACCOUNT_TAGS_FIELD_ID> - From Step 1
<ACCOUNT_TAG_OBJECT_ID> - From Step 1  
<TAG_FIELD_ID> - From Step 1
Step 3: Verify the Fix
After running the mutation:
Refresh the browser (clear cache if needed)
Navigate to an Account detail page
The accountTags field should now show Tag names as chips instead of UUIDs
Each chip should display the Tag's name and be clickable
Expected Behavior After Fix
Before:
accountTags: [12345-abc-..., 67890-def-...]
After:
accountTags: [Predatory] [NBFI] [Strategic]
            (colored chips with tag names)
How It Works
The junctionTargetFieldId setting tells Twenty's frontend:
The accountTags field points to junction records (AccountTag)
On each AccountTag, look at the tag field (specified by TAG_FIELD_ID)
Display the Tag record instead of the AccountTag record
Use the Tag's label identifier (name) for the chip display
This is exactly how Twenty handles other many-to-many relationships like:
Note → noteTargets → various target objects
Task → taskTargets → various target objects
Alternative: Using GraphQL Playground
If you're not sure where to run GraphQL queries:
Via Browser DevTools
Open Twenty in browser
Open DevTools (F12)
Go to Network tab
Filter for "graphql"
Find a POST request to /graphql
Right-click → "Edit and Resend" (Firefox) or use tools like Postman
Paste the mutation with your IDs
Via Twenty's GraphQL Playground (if available)
Navigate to http://localhost:3000/graphql (or your server URL)
The playground should be accessible with your auth token
Paste and run queries there
Via curl
curl 'http://localhost:3000/graphql' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  --data-raw '{"query":"mutation UpdateAccountTagsField { ... }"}'
Troubleshooting
Query Returns No Results
Check object names: might be "company" instead of "account"
Adjust the filter: { nameSingular: { eq: "company" } }
Mutation Fails with Permission Error
You need admin or DATA_MODEL permissions
Log in as a workspace admin
Still Showing UUIDs After Update
Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
Clear browser cache
Check that mutation succeeded by re-running Step 1 query
Verify junctionTargetFieldId is now present in settings
Field Not Found Error
The field might have a different name
List all fields on Account to verify:
query ListAccountFields {
  objects(filter: { nameSingular: { eq: "account" } }) {
    edges {
      node {
        fields {
          edges {
            node {
              id
              name
              type
            }
          }
        }
      }
    }
  }
}
Related Documentation
Account Tags Implementation: docs/account-tags-implementation.md
UI Configuration Guide: docs/ACCOUNT_TAGS_UI_CONFIGURATION.md
Field Visibility Guide: docs/FIELD_VISIBILITY_GUIDE.md
Reference: Junction Table Pattern in Twenty
Other examples of junction tables with junctionTargetFieldId:
noteTargets → points to polymorphic targets
taskTargets → points to polymorphic targets  
messageChannelMessageAssociations → points to messages
The setting structure:
{
  relationType: "ONE_TO_MANY",
  junctionTargetFieldId: {
    objectMetadataId: "<id-of-junction-object>",
    fieldMetadataId: "<id-of-target-field-on-junction>"
  }
}