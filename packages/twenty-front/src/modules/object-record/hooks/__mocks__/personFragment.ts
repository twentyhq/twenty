export const PERSON_FRAGMENT = `
      __typename
      updatedAt
      myCustomObjectId
      whatsapp {
        primaryPhoneNumber
        primaryPhoneCountryCode
        additionalPhones
      }
      linkedinLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
      }
      name {
        firstName
        lastName
      }
      email
      position
      createdBy {
        source
        workspaceMemberId
        name
      }
      avatarUrl
      jobTitle
      xLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
      }
      performanceRating
      createdAt
      phone {
        primaryPhoneNumber
        primaryPhoneCountryCode
        additionalPhones
      }
      id
      city
      companyId
      intro
      workPrefereance
`
