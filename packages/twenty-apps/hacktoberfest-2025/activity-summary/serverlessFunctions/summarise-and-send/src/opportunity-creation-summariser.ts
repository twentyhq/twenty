import { request } from "./utils"

type Opportunity = {
  stage: 'NEW' | 'PROPOSAL'
}

export const summariseOpportunityCreation = async (date: string) => {
  const { opportunities }: { opportunities: Opportunity[] } = await request(
    `opportunities?filter=createdAt[gte]:${date}`,
  )

  if (opportunities.length === 0) {
    return `- No Opportunities were added`
  }

  const stageSummary = Object.entries(
    opportunities.reduce((hash: Record<string,number>, opportunity) => {
      if (!hash[opportunity.stage]) {
        hash[opportunity.stage] = 0
      }

      hash[opportunity.stage] += 1
      return hash
    }, {})
  ).map(([stage, value]) => `${value} in ${stage}`).join(', ')

  return `- ${opportunities.length} Opportunities were added: ${stageSummary}`
}
