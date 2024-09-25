export const PERSON_FRAGMENT = `
      __typename
      name {
        firstName
        lastName
      }
      linkedinLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
      }
      deletedAt
      createdAt
      updatedAt
      jobTitle
      intro
      workPrefereance
      performanceRating
      xLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
      }
      city
      companyId
      phones {
        primaryPhoneNumber
        primaryPhoneCountryCode
        additionalPhones
      }
      createdBy {
        source
        workspaceMemberId
        name
      }
      id
      position
      emails {
        primaryEmail
        additionalEmails
      }
      avatarUrl
      whatsapp {
        primaryPhoneNumber
        primaryPhoneCountryCode
        additionalPhones
      }
`
