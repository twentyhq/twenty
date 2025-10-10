export const PERSON_FRAGMENT_WITH_DEPTH_ZERO_RELATIONS = `
      __typename
      avatarUrl
      city
      companyId
      createdAt
      createdBy {
        source
        workspaceMemberId
        name
        context
      }
      deletedAt
      emails {
        primaryEmail
        additionalEmails
      }
      id
      intro
      jobTitle
      linkedinLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
      }
      name {
        firstName
        lastName
      }
      performanceRating
      phones {
        primaryPhoneNumber
        primaryPhoneCountryCode
        primaryPhoneCallingCode
        additionalPhones
      }
      position
      updatedAt
      whatsapp {
        primaryPhoneNumber
        primaryPhoneCountryCode
        primaryPhoneCallingCode
        additionalPhones
      }
      workPreference
      xLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
      }
`;

export const PERSON_FRAGMENT_WITH_DEPTH_ONE_RELATIONS = `
      __typename
      attachments {
        edges {
          node {
            __typename
            id
            name
          }
        }
      }
      avatarUrl
      calendarEventParticipants {
        edges {
          node {
            __typename
            handle
            id
          }
        }
      }
      city
      company {
        __typename
        domainName {
          primaryLinkUrl
          primaryLinkLabel
          secondaryLinks
        }
        id
        name
      }
      companyId
      createdAt
      createdBy {
        source
        workspaceMemberId
        name
        context
      }
      deletedAt
      emails {
        primaryEmail
        additionalEmails
      }
      favorites {
        edges {
          node {
            __typename
            id
          }
        }
      }
      id
      intro
      jobTitle
      linkedinLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
      }
      messageParticipants {
        edges {
          node {
            __typename
            handle
            id
          }
        }
      }
      name {
        firstName
        lastName
      }
      noteTargets {
        edges {
          node {
            __typename
            id
          }
        }
      }
      performanceRating
      phones {
        primaryPhoneNumber
        primaryPhoneCountryCode
        primaryPhoneCallingCode
        additionalPhones
      }
      pointOfContactForOpportunities {
        edges {
          node {
            __typename
            id
            name
          }
        }
      }
      position
      taskTargets {
        edges {
          node {
            __typename
            id
          }
        }
      }
      timelineActivities {
        edges {
          node {
            __typename
            id
          }
        }
      }
      updatedAt
      whatsapp {
        primaryPhoneNumber
        primaryPhoneCountryCode
        primaryPhoneCallingCode
        additionalPhones
      }
      workPreference
      xLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
      }
`;
