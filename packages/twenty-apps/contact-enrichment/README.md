# Contact enrichment

Contact enrichment when new person record is created.

## Requirements
- twenty-cli `npm install -g twenty-cli`
- an `apiKey`. Go to `https://twenty.com/settings/api-webhooks` to generate one


## Setup
1. Synchronize app with Twenty
```bash
twenty auth login
cd contact-enrichment
twenty app sync
```
2. Go to Settings > Integrations > Contact enrichment > Settings and set variables

## Flow
- Check if input is from Twenty or Fullenrich
- Map all input properties properly
- If it's from Fullenrich, send a request to update existing records (person and related company)
- If it's from Twenty, check if requirements are met, if they're met, 
send a request to Fullenrich, if not, exit

## Notes
- Requirements are like here:
  - LinkedIn or
  - first and last name with 
    - company name or
    - company domain
- App will send a request only if one of requirements is met
- 