import { request } from "./utils"

type Person = {
  companyId: string
}

type Company = {
  id: string
  accountOwnerId: string
}

export const summarisePeopleCreation = async (date: string) => {
  const { people }: { people: Person[] } = await request(
    `people?filter=createdAt[gte]:${date}`,
  )

  if (people.length === 0) {
    return '- No People were added'
  }

  let createdForCompanies: Record<string, Company> = {}
  let numberOfAccountOwnerlessCompanies = 0

  for (const person of people) {
    const isCompanyTracked = createdForCompanies[person.companyId]
    if (person.companyId && !isCompanyTracked) {
      const { company }: { company: Company } = await request(
        `companies/${person.companyId}`,
      )
      createdForCompanies[company.id] = company

      if (!company.accountOwnerId) {
        numberOfAccountOwnerlessCompanies += 1
      }
    }
  }

  return `- ${people.length} People were added for ${Object.keys(createdForCompanies).length} Companies
- Out of those, ${numberOfAccountOwnerlessCompanies} Companies don't have account owners yet`
}
