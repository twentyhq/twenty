import { defineSkill } from 'twenty-sdk/define';

export default defineSkill({
  universalIdentifier: 'b4f929d9-c911-45ee-b1c4-6f07f3dfc8a1',
  name: 'xopure-contact-enrichment',
  label: 'XO Pure Contact Enrichment',
  description: 'Research and enrich customer, ambassador, retail prospect, and influencer prospect records.',
  icon: 'IconUserSearch',
  content:
    'Enrich contacts with verified business, creator, location, audience, website, social, and outreach data. Keep customer and ambassador records separate from prospecting databases. Do not overwrite synced Supabase identifiers. Summarize sources and confidence in the research summary fields.',
});
