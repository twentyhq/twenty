import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { formatChatReference } from '@/ai/utils/formatChatReference';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { styled } from '@linaria/react';
import { useStore } from 'jotai';
import { type ReactNode, useEffect, useState } from 'react';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const StyledContainer = styled.div`
  max-width: 640px;
`;

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const employeesFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'employees',
});

const allCompaniesView = {
  id: '20202020-4444-4444-4444-444444444444',
  name: 'All Companies',
  icon: 'IconList',
  objectMetadataId: companyObjectMetadataItem.id,
  isActive: true,
} as ViewWithRelations;

// Declared locally because ObjectMetadataItemsDecorator drops every mocked view,
// and importing the generated view mocks breaks the linaria build-time evaluator.
const ChatReferenceStoreSeeder = ({ children }: { children: ReactNode }) => {
  const store = useStore();
  const [isSeeded, setIsSeeded] = useState(false);

  useEffect(() => {
    setTestViewsInMetadataStore(store, [allCompaniesView]);

    store.set(currentUserWorkspaceState.atom, {
      permissionFlags: [PermissionFlagType.DATA_MODEL],
      twoFactorAuthenticationMethodSummary: [],
      objectsPermissions: [],
    });

    setIsSeeded(true);
  }, [store]);

  return isSeeded ? <>{children}</> : null;
};

const meta: Meta<typeof LazyMarkdownRenderer> = {
  title: 'Modules/AiChat/ChatReferenceChip',
  component: LazyMarkdownRenderer,
  decorators: [
    (Story) => (
      <ChatReferenceStoreSeeder>
        <StyledContainer>
          <Story />
        </StyledContainer>
      </ChatReferenceStoreSeeder>
    ),
    ObjectMetadataItemsDecorator,
    IconsProviderDecorator,
    ComponentWithRouterDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof LazyMarkdownRenderer>;

export const ExistingMetadata: Story = {
  args: {
    text: `Your ${formatChatReference({
      kind: 'object',
      objectNameSingular: 'company',
      displayName: 'Companies',
    })} object is sorted by ${formatChatReference({
      kind: 'field',
      fieldMetadataItemId: employeesFieldMetadataItem.id,
      displayName: 'Employees',
    })} in the ${formatChatReference({
      kind: 'view',
      viewId: allCompaniesView.id,
      displayName: allCompaniesView.name,
    })} view.`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect((await canvas.findByText('Companies')).closest('a')).toHaveAttribute(
      'href',
      `/objects/${companyObjectMetadataItem.namePlural}`,
    );
    expect((await canvas.findByText('Employees')).closest('a')).toHaveAttribute(
      'href',
      `/settings/objects/${companyObjectMetadataItem.namePlural}/${employeesFieldMetadataItem.name}`,
    );
    expect(
      (await canvas.findByText('All Companies')).closest('a'),
    ).toHaveAttribute(
      'href',
      `/objects/${companyObjectMetadataItem.namePlural}?viewId=${allCompaniesView.id}`,
    );
  },
};

export const ProposedObject: Story = {
  args: {
    text: `As a Head of Partnerships, you seem to work across partner companies, key contacts, and commercial follow-ups, so I suggest creating a ${formatChatReference(
      {
        kind: 'object',
        objectNameSingular: 'partner',
        displayName: 'Partners',
      },
    )} object to track relationship status, partner type, owner, and next step. Should I create it?`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const proposedObjectChipLabel = await canvas.findByText('Partners');

    expect(proposedObjectChipLabel).toBeVisible();
    expect(proposedObjectChipLabel.closest('a')).toBeNull();
  },
};
