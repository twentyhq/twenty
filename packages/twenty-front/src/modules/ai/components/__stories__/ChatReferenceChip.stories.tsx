import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
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
    text: `Your [[object:company:Companies[[/object]] object is sorted by [[field:${employeesFieldMetadataItem.id}:Employees[[/field]] in the [[view:${allCompaniesView.id}:${allCompaniesView.name}[[/view]] view.`,
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

export const SurplusClosingBrackets: Story = {
  args: {
    text: `I created the [[object:company:Companies[[/object]]] object.`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Companies')).toBeVisible();
    expect(canvasElement).toHaveTextContent('I created the Companies object.');
  },
};

export const LegacyClosingTerminator: Story = {
  args: {
    text: `## [[object:project:Project]] object created\n\n| Relation | Links to |\n| --- | --- |\n| Owner | [[object:workspaceMember:Workspace Member]] |\n| Company | [[object:company:Companies]] |`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Project')).toBeVisible();
    expect(await canvas.findByText('Workspace Member')).toBeVisible();
    expect((await canvas.findByText('Companies')).closest('a')).toHaveAttribute(
      'href',
      `/objects/${companyObjectMetadataItem.namePlural}`,
    );
    expect(canvasElement).not.toHaveTextContent('[[object:');
  },
};

export const DisplayNameContainingAUrl: Story = {
  args: {
    text: `I created the [[object:company:Acme www.acme.com[[/object]] object.`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Acme www.acme.com')).toBeVisible();
    expect(canvasElement).not.toHaveTextContent('[[/object]]');
  },
};

export const ReferenceInsideALink: Story = {
  args: {
    text: `See [the [[object:company:Companies[[/object]] list](https://twenty.com) for details.`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const link = await canvas.findByRole('link', {
      name: 'the Companies list',
    });

    expect(link).toHaveAttribute('href', 'https://twenty.com');
    expect(link.querySelector('a')).toBeNull();
  },
};

export const ReferenceInsideInlineCode: Story = {
  args: {
    text: `Write it as \`[[object:company:Companies[[/object]]\` in your prompt.`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const code = await canvas.findByText('Companies');

    expect(code.tagName).toBe('CODE');
    expect(code.querySelector('a')).toBeNull();
  },
};

export const ProposedObject: Story = {
  args: {
    text: `As a Head of Partnerships, you seem to work across partner companies, key contacts, and commercial follow-ups, so I suggest creating a [[object:partner:Partners[[/object]] object to track relationship status, partner type, owner, and next step. Should I create it?`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const proposedObjectChipLabel = await canvas.findByText('Partners');

    expect(proposedObjectChipLabel).toBeVisible();
    expect(proposedObjectChipLabel.closest('a')).toBeNull();
  },
};
