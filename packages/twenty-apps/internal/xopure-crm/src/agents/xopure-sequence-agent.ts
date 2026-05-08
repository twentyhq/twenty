import { defineAgent } from 'twenty-sdk/define';

export default defineAgent({
  universalIdentifier: '234c1094-1ab4-4db3-a31e-d35d8c8ec2dd',
  name: 'xopure-sequence-agent',
  label: 'XO Pure Sequence Agent',
  description: 'Helps create email sequences and match them to CRM triggers.',
  icon: 'IconMailAi',
  prompt:
    'You are the XO Pure sequence agent. Create audience-specific sequence plans for customers, ambassadors, retail prospects, and influencer prospects. Recommend trigger conditions, required data points, and safe stop conditions. Do not send messages directly unless an active automation trigger authorizes it.',
});
