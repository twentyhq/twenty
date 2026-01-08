# Last email interaction

Updates Last interaction and Interaction status fields based on last email date

## Requirements
- an `apiKey` - go to Settings > API & Webhooks to generate one

## Setup
1. Add and synchronize app
```bash
cd packages/twenty-apps/community/last-email-interaction
yarn auth
yarn sync
```
2. Go to Settings > Integrations > Last email interaction > Settings and add required variables

## Flow
- Checks if fields are created, if not, creates them on fly
- Extracts the datetime of message and calculates the last interaction status
- Fetches all users and companies connected to them and updates their Last interaction and Interaction status fields

## Todo:
- update app with generated Twenty object once extending objects is possible