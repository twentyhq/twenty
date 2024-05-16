import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { useSetRecoilState } from 'recoil';
import { ComponentDecorator } from 'twenty-ui';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { RelationFieldDisplay } from '@/object-record/record-field/meta-types/display/components/RelationFieldDisplay';
import {
  RecordFieldValueSelectorContextProvider,
  useSetRecordValue,
} from '@/object-record/record-index/contexts/RecordFieldValueSelectorContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { FieldMetadataType } from '~/generated/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

const mock = {
  entityId: '20202020-2d40-4e49-8df4-9c6a049191df',
  relationEntityId: '20202020-c21e-4ec2-873b-de4264d89025',
  entityValue: {
    __typename: 'Person',
    asd: '',
    city: 'Seattle',
    jobTitle: '',
    name: {
      __typename: 'FullName',
      firstName: 'Lorie',
      lastName: 'Vladim',
    },
    createdAt: '2024-05-01T13:16:29.046Z',
    company: {
      __typename: 'Company',
      domainName: 'google.com',
      xLink: {
        __typename: 'Link',
        label: '',
        url: '',
      },
      name: 'Google',
      annualRecurringRevenue: {
        __typename: 'Currency',
        amountMicros: null,
        currencyCode: '',
      },
      employees: null,
      accountOwnerId: null,
      address: '',
      idealCustomerProfile: false,
      createdAt: '2024-05-01T13:16:29.046Z',
      id: '20202020-c21e-4ec2-873b-de4264d89025',
      position: 6,
      updatedAt: '2024-05-01T13:16:29.046Z',
      linkedinLink: {
        __typename: 'Link',
        label: '',
        url: '',
      },
    },
    id: '20202020-2d40-4e49-8df4-9c6a049191df',
    email: 'lorie.vladim@google.com',
    phone: '+33788901235',
    linkedinLink: {
      __typename: 'Link',
      label: '',
      url: '',
    },
    xLink: {
      __typename: 'Link',
      label: '',
      url: '',
    },
    tEst: '',
    position: 15,
  },
  relationFieldValue: {
    __typename: 'Company',
    domainName: 'microsoft.com',
    xLink: {
      __typename: 'Link',
      label: '',
      url: '',
    },
    name: 'Microsoft',
    annualRecurringRevenue: {
      __typename: 'Currency',
      amountMicros: null,
      currencyCode: '',
    },
    employees: null,
    accountOwnerId: null,
    address: '',
    idealCustomerProfile: false,
    createdAt: '2024-05-01T13:16:29.046Z',
    id: '20202020-ed89-413a-b31a-962986e67bb4',
    position: 4,
    updatedAt: '2024-05-01T13:16:29.046Z',
    linkedinLink: {
      __typename: 'Link',
      label: '',
      url: '',
    },
  },
  fieldDefinition: {
    fieldMetadataId: '4e79f0b7-d100-4e89-a07b-315a710b8059',
    label: 'Company',
    metadata: {
      fieldName: 'company',
      placeHolder: 'Company',
      relationType: 'TO_ONE_OBJECT',
      relationFieldMetadataId: '01fa2247-7937-4493-b7e2-3d72f05d6d25',
      relationObjectMetadataNameSingular: 'company',
      relationObjectMetadataNamePlural: 'companies',
      objectMetadataNameSingular: 'person',
      options: null,
    },
    iconName: 'IconBuildingSkyscraper',
    type: FieldMetadataType.Relation,
    position: 2,
    size: 150,
    isLabelIdentifier: false,
    isVisible: true,
    viewFieldId: '924f4c94-cbcd-4de5-b7a2-ebae2f0b2c3b',
    isSortable: false,
    isFilterable: true,
    defaultValue: null,
  },
};

const RelationFieldValueSetterEffect = () => {
  const setEntity = useSetRecoilState(recordStoreFamilyState(mock.entityId));

  const setRelationEntity = useSetRecoilState(
    recordStoreFamilyState(mock.relationEntityId),
  );

  const setRecordValue = useSetRecordValue();

  useEffect(() => {
    setEntity(mock.entityValue);
    setRelationEntity(mock.relationFieldValue);

    setRecordValue(mock.entityValue.id, mock.entityValue);
    setRecordValue(mock.relationFieldValue.id, mock.relationFieldValue);
  }, [setEntity, setRelationEntity, setRecordValue]);

  return null;
};

const meta: Meta = {
  title: 'UI/Data/Field/Display/RelationFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    (Story) => (
      <RecordFieldValueSelectorContextProvider>
        <FieldContext.Provider
          value={{
            entityId: mock.entityId,
            basePathToShowPage: '/object-record/',
            isLabelIdentifier: false,
            fieldDefinition: {
              ...mock.fieldDefinition,
            },
            hotkeyScope: 'hotkey-scope',
          }}
        >
          <RelationFieldValueSetterEffect />
          <Story />
        </FieldContext.Provider>
      </RecordFieldValueSelectorContextProvider>
    ),
    ComponentDecorator,
  ],
  component: RelationFieldDisplay,
  argTypes: { value: { control: 'date' } },
  args: {},
};

export default meta;

type Story = StoryObj<typeof RelationFieldDisplay>;

export const Default: Story = {};

export const Performance = getProfilingStory({
  componentName: 'RelationFieldDisplay',
  averageThresholdInMs: 0.4,
  numberOfRuns: 20,
  numberOfTestsPerRun: 100,
});
