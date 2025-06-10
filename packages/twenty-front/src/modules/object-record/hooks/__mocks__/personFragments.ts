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
            authorId
            companyId
            createdAt
            deletedAt
            fullPath
            id
            name
            noteId
            opportunityId
            personId
            petId
            surveyResultId
            taskId
            type
            updatedAt
          }
        }
      }
      avatarUrl
      calendarEventParticipants {
        edges {
          node {
            __typename
            calendarEventId
            createdAt
            deletedAt
            displayName
            handle
            id
            isOrganizer
            personId
            responseStatus
            updatedAt
            workspaceMemberId
          }
        }
      }
      city
      company {
        __typename
        accountOwnerId
        address {
          addressStreet1
          addressStreet2
          addressCity
          addressState
          addressCountry
          addressPostcode
          addressLat
          addressLng
        }
        annualRecurringRevenue {
          amountMicros
          currencyCode
        }
        createdAt
        createdBy {
          source
          workspaceMemberId
          name
          context
        }
        deletedAt
        domainName {
          primaryLinkUrl
          primaryLinkLabel
          secondaryLinks
        }
        employees
        id
        idealCustomerProfile
        internalCompetitions
        introVideo {
          primaryLinkUrl
          primaryLinkLabel
          secondaryLinks
        }
        linkedinLink {
          primaryLinkUrl
          primaryLinkLabel
          secondaryLinks
        }
        name
        position
        tagline
        updatedAt
        visaSponsorship
        workPolicy
        xLink {
          primaryLinkUrl
          primaryLinkLabel
          secondaryLinks
        }
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
            companyId
            createdAt
            deletedAt
            favoriteFolderId
            forWorkspaceMemberId
            id
            noteId
            opportunityId
            personId
            petId
            position
            surveyResultId
            taskId
            updatedAt
            viewId
            workflowId
            workflowRunId
            workflowVersionId
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
            createdAt
            deletedAt
            displayName
            handle
            id
            messageId
            personId
            role
            updatedAt
            workspaceMemberId
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
            companyId
            createdAt
            deletedAt
            id
            noteId
            opportunityId
            personId
            petId
            surveyResultId
            updatedAt
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
            amount {
              amountMicros
              currencyCode
            }
            closeDate
            companyId
            createdAt
            createdBy {
              source
              workspaceMemberId
              name
              context
            }
            deletedAt
            id
            name
            pointOfContactId
            position
            stage
            updatedAt
          }
        }
      }
      position
      taskTargets {
        edges {
          node {
            __typename
            companyId
            createdAt
            deletedAt
            id
            opportunityId
            personId
            petId
            surveyResultId
            taskId
            updatedAt
          }
        }
      }
      timelineActivities {
        edges {
          node {
            __typename
            companyId
            createdAt
            deletedAt
            happensAt
            id
            linkedObjectMetadataId
            linkedRecordCachedName
            linkedRecordId
            name
            noteId
            opportunityId
            personId
            petId
            properties
            surveyResultId
            taskId
            updatedAt
            workflowId
            workflowRunId
            workflowVersionId
            workspaceMemberId
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
