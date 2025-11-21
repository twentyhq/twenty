# Updated by

Updates Updated by field with details of person behind newest update

## Requirements
- twenty-cli `npm install -g twenty-cli`
- an `apiKey`. Go to `https://twenty.com/settings/api-webhooks` to generate one

## Quick start

1. Add application
```bash
twenty auth login
cd packages/twenty-apps/updated-by
twenty app sync
```

2. Configure **TWENTY_API_KEY**

Go to Settings > Applications > Updated by > Settings and add Twenty API key used to
send requests to Twenty. 

**If you're using self-hosted instance, you have to add also URL to your workspace.**

## Flow

1. Check if Twenty API key is added, if not, exit
2. Check if updated record belongs to an object which shouldn't have a `updatedBy` field (like blocklists or messages), if yes, exit
3. Check if updated record has updatedBy field, if not, create it
4. Check if updated field in record is updatedBy field, if yes, return preemptively
5. Update record with workspace member ID

## Notes

- Updated by field shouldn't be changed by users, only by extension 
- Amount of API requests is reduced to possible minimum
