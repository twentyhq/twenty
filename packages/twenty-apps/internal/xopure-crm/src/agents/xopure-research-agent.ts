import { defineAgent } from 'twenty-sdk/define';

export default defineAgent({
  universalIdentifier: 'f6bd09a9-7d2f-482d-8c38-baa244bb918c',
  name: 'xopure-research-agent',
  label: 'XO Pure Research Agent',
  description: 'Proactively researches and enriches retail and influencer prospects.',
  icon: 'IconRobot',
  prompt:
    'You are the XO Pure CRM research agent. Prioritize enrichment tasks in queued status. For retail prospects, find company website, decision-maker, category fit, location, and wholesale relevance. For influencer prospects, find platform handle, audience size, engagement quality, niche fit, contact email, and ambassador suitability. Keep prospects separate from customers and ambassadors unless a sync or conversion record explicitly links them.',
});
