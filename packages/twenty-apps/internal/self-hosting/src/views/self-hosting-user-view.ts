import { defineView } from 'twenty-sdk';
import { UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers.constant';

export default defineView({
  universalIdentifier:
    UNIVERSAL_IDENTIFIERS.views.selfHostingUserView.universalIdentifier,
  name: 'Self hosting users',
  objectUniversalIdentifier:
    UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.universalIdentifier,
  icon: 'IconList',
  position: 0,
  fields: [
    {
      universalIdentifier: '243a2401-cd13-440c-8dcd-649e26df36bc',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.name
          .universalIdentifier,
      position: 0,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: 'dfa75ef8-d40d-416f-9f1c-3e86edfa9fce',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.email
          .universalIdentifier,
      position: 1,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: '15cc9215-eb48-4487-a92e-a25d8e99702f',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.domain
          .universalIdentifier,
      position: 2,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '0f9e4f63-3664-443a-9f06-8a6cc04c1d90',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.personId
          .universalIdentifier,
      position: 2.1,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'dcf88ae8-e71d-452f-b51e-d88cbc6dd273',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.userWorkspaceId
          .universalIdentifier,
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier: 'aad70516-936b-41d1-b6c6-961a22299761',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.userId
          .universalIdentifier,
      position: 4,
      isVisible: true,
    },
    {
      universalIdentifier: '8c210eb0-bdda-476e-9f98-42f909872f2a',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.locale
          .universalIdentifier,
      position: 5,
      isVisible: true,
    },
    {
      universalIdentifier: '367abe85-11c4-440f-80a2-663edd6b4231',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.serverUrl
          .universalIdentifier,
      position: 6,
      isVisible: true,
    },
    {
      universalIdentifier: '32c199d6-ebf3-434b-81b4-e2b59a0518b7',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.serverId
          .universalIdentifier,
      position: 6.1,
      isVisible: true,
    },
    {
      universalIdentifier: '924ee786-ab93-44be-9d21-941ff9ffe1ac',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields
          .numberOfEmailsWithSameDomain.universalIdentifier,
      position: 7,
      isVisible: true,
    },
    {
      universalIdentifier: '2feadf3d-e251-4356-add8-7fa70dea5401',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.isEnriched
          .universalIdentifier,
      position: 8,
      isVisible: true,
    },
    {
      universalIdentifier: 'de252ae6-c723-4bf7-96cf-d93f5a539f36',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.triedToBeEnriched
          .universalIdentifier,
      position: 9,
      isVisible: true,
    },
    {
      universalIdentifier: 'b121e8e6-b3eb-4f6c-b67e-c7c6d19e1bc5',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.isPersonalEmail
          .universalIdentifier,
      position: 10,
      isVisible: true,
    },
    {
      universalIdentifier: '0ada0bcc-8d6b-4df6-bcc1-78ba14cb04e6',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.isTwenty
          .universalIdentifier,
      position: 11,
      isVisible: true,
    },
    {
      universalIdentifier: 'ec7c8d51-ea63-41bd-9eb1-995835b94218',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.personCity
          .universalIdentifier,
      position: 12,
      isVisible: true,
    },
    {
      universalIdentifier: '7522dd84-0d23-48e7-85dd-f0a8d9e275f8',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.personCountry
          .universalIdentifier,
      position: 13,
      isVisible: true,
    },
    {
      universalIdentifier: '54191cb9-4d5c-466e-affb-d9ba4adeff87',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.personJobFunction
          .universalIdentifier,
      position: 14,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'ace75fc7-fb20-4e53-a9a2-6a7529befaf0',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.personJobTitle
          .universalIdentifier,
      position: 15,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'a0b42d61-4553-42eb-aca4-327b9bf9f30e',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.personLinkedIn
          .universalIdentifier,
      position: 16,
      isVisible: true,
    },
    {
      universalIdentifier: '74bc7dd2-fe53-4ff4-8778-2768f3439571',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.personSeniority
          .universalIdentifier,
      position: 17,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '61b34f41-8d56-472d-ab1e-414703c6ca12',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.companyAlexaRank
          .universalIdentifier,
      position: 18,
      isVisible: true,
    },
    {
      universalIdentifier: '5bb7d36b-6a73-4832-b41e-f67130a4708f',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields
          .companyAnnualRevenue.universalIdentifier,
      position: 19,
      isVisible: true,
    },
    {
      universalIdentifier: 'ae6f23ce-006c-41dd-82a1-e9fe7b65bce3',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields
          .companyAnnualRevenuePrinted.universalIdentifier,
      position: 20,
      isVisible: true,
      size: 250,
    },
    {
      universalIdentifier: 'dd2a4728-a743-43bb-b096-9e7bd5125e56',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.companyDescription
          .universalIdentifier,
      position: 21,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'ecca02c9-db2e-41e2-b571-b5db75054b56',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.companyEmployees
          .universalIdentifier,
      position: 22,
      isVisible: true,
    },
    {
      universalIdentifier: '2e76775b-f8b8-4184-8cd3-72d2b93edaa2',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.companyFoundedYear
          .universalIdentifier,
      position: 23,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'a7eb002c-6f0c-48ba-a9eb-247c498ad9bd',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields
          .companyFundingLatestStage.universalIdentifier,
      position: 24,
      isVisible: true,
      size: 240,
    },
    {
      universalIdentifier: '61be97f6-20da-4b2b-861d-32345e0f9953',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields
          .companyFundingTotalAmount.universalIdentifier,
      position: 25,
      isVisible: true,
    },
    {
      universalIdentifier: '55720810-3120-4e76-bcf2-2da9517edbbc',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields
          .companyFundingTotalAmountPrinted.universalIdentifier,
      position: 26,
      isVisible: true,
      size: 280,
    },
    {
      universalIdentifier: '01e31752-cbc1-499a-8ecf-504dd402d7e2',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.companyIndustries
          .universalIdentifier,
      position: 27,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '2e1c8b8b-469b-483e-8348-1fe3d1764e17',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.companyIndustry
          .universalIdentifier,
      position: 28,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '976cc8ae-6cf8-4c30-8da4-5bf61e799893',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.companyLinkedIn
          .universalIdentifier,
      position: 29,
      isVisible: true,
    },
    {
      universalIdentifier: '5f0776b3-2849-4b9b-82f0-baa38c6d889d',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.companyName
          .universalIdentifier,
      position: 30,
      isVisible: true,
    },
    {
      universalIdentifier: '86f0397a-2924-4e5c-a610-3c9ad7bb4923',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.companyTags
          .universalIdentifier,
      position: 31,
      isVisible: true,
    },
    {
      universalIdentifier: '562084f4-1242-4e60-868b-1d9b268a35b0',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.companyTech
          .universalIdentifier,
      position: 32,
      isVisible: true,
    },
  ],
});
