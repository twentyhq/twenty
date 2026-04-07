# Last email interaction

Updates Last interaction and Interaction status fields based on last email date

## Setup
Add and synchronize app
```bash
cd packages/twenty-apps/community/last-email-interaction
yarn twenty remote add
yarn twenty install
```

## Flow
- Extracts the datetime of fetched message and calculates the last interaction status
- Fetches all users and companies connected to the message and updates their Last interaction and Interaction status fields

## Notes
- Upon install, creates fields to Person and Company objects
- Every day at midnight app goes through all companies and people records and updates their Interaction status based on Last interaction date