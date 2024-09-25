export const PERSON_FRAGMENT = `
      __typename
      id
      position
      name {
        firstName
        lastName
      }
      linkedinLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
      }
      createdAt
      avatarUrl
      companyId
      performanceRating
      emails {
        primaryEmail
        additionalEmails
      }
      whatsapp
      deletedAt
      city
      createdBy {
        source
        workspaceMemberId
        name
      }
      phone
      workPrefereance
      intro
      jobTitle
      updatedAt
      xLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
      }
`
