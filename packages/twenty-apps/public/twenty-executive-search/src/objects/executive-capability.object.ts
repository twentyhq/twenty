import { defineObject, FieldType, RelationType } from 'twenty-sdk/define';
import { EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER } from './executive-profile.object';

enum CapabilitySource {
  CLAIMED = 'CLAIMED',
  VERIFIED = 'VERIFIED',
  AI_SUGGESTED = 'AI_SUGGESTED',
}

export const EXECUTIVE_CAPABILITY_UNIVERSAL_IDENTIFIER =
  '032b911b-09a5-4dec-9328-9d3ad953f24a';

export const EXECUTIVE_CAPABILITY_EP_RELATION_UNIVERSAL_IDENTIFIER =
  '78755b8e-03b1-4f92-83c0-fe14af5fb32b';

export const EXECUTIVE_CAPABILITY_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER =
  '864c1451-72f8-4b91-a7cd-7d60574d76f9';

export const EXECUTIVE_CAPABILITY_SOURCE_FIELD_UNIVERSAL_IDENTIFIER =
  '5f1eb72b-4ba2-4fbd-86fc-502ca0a357e6';

export default defineObject({
  universalIdentifier: EXECUTIVE_CAPABILITY_UNIVERSAL_IDENTIFIER,
  nameSingular: 'executiveCapability',
  namePlural: 'executiveCapabilities',
  labelSingular: 'Capability',
  labelPlural: 'Capabilities',
  description:
    'A skill or capability attributed to the executive, with a provenance source classification.',
  icon: 'IconBrain',
  labelIdentifierFieldMetadataUniversalIdentifier:
    'e5d5650c-4909-4b42-aa53-d8637a73d6ad',
  fields: [
    // MANY_TO_ONE to executiveProfile
    {
      universalIdentifier:
        EXECUTIVE_CAPABILITY_EP_RELATION_UNIVERSAL_IDENTIFIER,
      type: FieldType.RELATION,
      name: 'executiveProfile',
      label: 'Executive Profile',
      description: 'The parent executive profile.',
      relationTargetObjectMetadataUniversalIdentifier:
        EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        EXECUTIVE_CAPABILITY_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    {
      universalIdentifier: 'e5d5650c-4909-4b42-aa53-d8637a73d6ad',
      type: FieldType.TEXT,
      label: 'Skill',
      description: 'Name of the skill or capability.',
      icon: 'IconStar',
      name: 'skill',
    },
    {
      universalIdentifier:
        EXECUTIVE_CAPABILITY_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      label: 'Source',
      description: 'Provenance classification for this capability.',
      icon: 'IconSourceCode',
      options: [
        {
          id: '9b5670ec-38aa-4e2e-8f25-10e0944c6c16',
          value: CapabilitySource.CLAIMED,
          label: 'Claimed',
          position: 0,
          color: 'blue',
        },
        {
          id: '04d70a5f-3674-408c-b97f-aadfb5f1ce8a',
          value: CapabilitySource.VERIFIED,
          label: 'Verified',
          position: 1,
          color: 'green',
        },
        {
          id: 'b8a12106-ec7a-4a38-b97d-82e2a41a4dbb',
          value: CapabilitySource.AI_SUGGESTED,
          label: 'AI Suggested',
          position: 2,
          color: 'yellow',
        },
      ],
      name: 'source',
    },
  ],
  indexes: [
    {
      universalIdentifier: '1ea16d33-da65-45ea-b06d-be43daec499b',
      objectUniversalIdentifier: EXECUTIVE_CAPABILITY_UNIVERSAL_IDENTIFIER,
      name: 'idx_executiveCapability_executiveProfileId',
      fields: [
        {
          universalIdentifier: '4e2ab93f-85b2-44fd-b77d-61874fe09241',
          fieldName: 'executiveProfile',
        },
      ],
    },
  ],
});
