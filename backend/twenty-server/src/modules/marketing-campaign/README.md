# Marketing Campaigns

Multi-channel campaign management with email/WhatsApp/SMS/LinkedIn/Google Ads/Facebook, lead scoring, audience segmentation, and performance tracking.

## Entities
- `MarketingCampaignEntity` — name, status (draft/scheduled/active/paused/completed), channel (email/whatsapp/sms/linkedin/google_ads/facebook/event), audience, budget, metrics (sent/opened/clicked/converted)
- Lead scoring entities with configurable actions (email_open/click/page_visit/form_submit/demo_request/pricing_visit)

## Service Methods
- `MarketingCampaignService` — creates and manages campaigns, segments audiences, tracks engagement metrics per channel, calculates lead scores based on behavioral actions, measures campaign ROI

## Feature Flag
`IS_MODULE_MARKETING_ENABLED`

## Dependencies
- None
