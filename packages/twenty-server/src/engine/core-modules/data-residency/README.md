# Data Residency

Data sovereignty management with region selection, migration tracking, and compliance enforcement.

## Entities
- `DataResidencyEntity` — workspaceId, currentRegion (us-east/us-west/eu-west/eu-central/asia-pacific/latam/colombia/canada), requestedRegion, status (active/pending/migrating/failed), migrationStartedAt, migrationCompletedAt

## Service Methods
- `DataResidencyService` — configures workspace data region, initiates region migration, tracks migration progress, validates compliance requirements

## Feature Flag
N/A (core infrastructure module)

## Dependencies
- None
