export const PERSON_FRAGMENT_WITH_DEPTH_ZERO_RELATIONS = `
      __typename
      avatarFile {
        fileId
        label
        extension
        url
      }
      avatarUrl
      city
      companyId
      createdAt
      createdBy {
        source
        workspaceMemberId
        name
        context {
          provider
        }
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
        secondaryLinks {
          label
          url
        }
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
        additionalPhones {
          number
          callingCode
          countryCode
        }
      }
      position
      updatedAt
      updatedBy {
        source
        workspaceMemberId
        name
        context {
          provider
        }
      }
      whatsapp {
        primaryPhoneNumber
        primaryPhoneCountryCode
        primaryPhoneCallingCode
        additionalPhones {
          number
          callingCode
          countryCode
        }
      }
      workPreference
      xLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks {
          label
          url
        }
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
      avatarFile {
        fileId
        label
        extension
        url
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
      caredForPets {
        edges {
          node {
            __typename
            id
            pet {
              __typename
              id
              name
            }
          }
        }
      }
      city
      company {
        __typename
        domainName {
          primaryLinkUrl
          primaryLinkLabel
          secondaryLinks {
            label
            url
          }
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
        context {
          provider
        }
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
        secondaryLinks {
          label
          url
        }
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
            note {
              __typename
              id
              title
            }
          }
        }
      }
      performanceRating
      phones {
        primaryPhoneNumber
        primaryPhoneCountryCode
        primaryPhoneCallingCode
        additionalPhones {
          number
          callingCode
          countryCode
        }
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
      previousCompanies {
        edges {
          node {
            __typename
            company {
              __typename
              domainName {
                primaryLinkUrl
                primaryLinkLabel
                secondaryLinks {
                  label
                  url
                }
              }
              id
              name
            }
            id
          }
        }
      }
      taskTargets {
        edges {
          node {
            __typename
            id
            task {
              __typename
              id
              title
            }
          }
        }
      }
      timelineActivities {
        edges {
          node {
            __typename
            id
            name
          }
        }
      }
      updatedAt
      updatedBy {
        source
        workspaceMemberId
        name
        context {
          provider
        }
      }
      whatsapp {
        primaryPhoneNumber
        primaryPhoneCountryCode
        primaryPhoneCallingCode
        additionalPhones {
          number
          callingCode
          countryCode
        }
      }
      workPreference
      xLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks {
          label
          url
        }
      }
`;
