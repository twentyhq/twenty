import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { EditorContent } from '@tiptap/react';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { useAdvancedTextEditor } from '@/advanced-text-editor/hooks/useAdvancedTextEditor';
import { AiChatAddMenu } from '@/ai/components/AiChatAddMenu';
import { AI_CHAT_EDITOR_PROFILE } from '@/ai/constants/AiChatEditorProfile';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedUserData } from '~/testing/mock-data/users';

const StyledComposer = styled.div`
  margin-top: 320px;
  width: 400px;
`;

const AiChatAddMenuWithEditor = () => {
  const editor = useAdvancedTextEditor({
    profile: AI_CHAT_EDITOR_PROFILE,
    placeholder: 'Ask anything',
    readonly: false,
    defaultValue: null,
    onUpdate: () => {},
  });

  return (
    <StyledComposer>
      <EditorContent editor={editor} />
      <AiChatAddMenu editor={editor} />
    </StyledComposer>
  );
};

const meta: Meta<typeof AiChatAddMenuWithEditor> = {
  title: 'Modules/AI/AiChatAddMenu',
  component: AiChatAddMenuWithEditor,
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
  ],
  parameters: {
    container: { height: 440 },
    currentUserWorkspace: {
      ...mockedUserData.currentUserWorkspace,
      permissionFlags: [
        ...(mockedUserData.currentUserWorkspace?.permissionFlags ?? []),
        PermissionFlagType.AI_SETTINGS,
      ],
    },
    msw: {
      handlers: [
        graphql.query('FindManySkillsForSuggestion', () =>
          HttpResponse.json({
            data: {
              skills: [
                {
                  __typename: 'Skill',
                  id: '20202020-5e21-4b07-9c3a-1d4f6e8a0b52',
                  name: 'meeting-prep',
                  label: 'Meeting Prep',
                  description: null,
                  icon: 'IconCalendarEvent',
                  isActive: true,
                  isSystem: false,
                },
              ],
            },
          }),
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof AiChatAddMenuWithEditor>;

const openAddMenu = async (canvasElement: HTMLElement) => {
  await userEvent.click(
    await within(canvasElement).findByRole('button', {
      name: 'Add files, records or skills',
    }),
  );

  return within(
    await within(canvasElement.ownerDocument.body).findByRole('menu', {
      name: 'Add files, records or skills',
    }),
  );
};

export const InsertRecord: Story = {
  play: async ({ canvasElement }) => {
    const menu = await openAddMenu(canvasElement);

    await userEvent.click(menu.getByRole('menuitem', { name: /Records/ }));
    await userEvent.click(
      await menu.findByRole('button', { name: /Jeffery Griffin/ }),
    );

    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Jeffery Griffin')).toBeVisible();
    await waitFor(() => expect(canvas.getByRole('textbox')).toHaveFocus());
  },
};

export const InsertSkill: Story = {
  play: async ({ canvasElement }) => {
    const menu = await openAddMenu(canvasElement);

    await userEvent.click(menu.getByRole('menuitem', { name: /Skills/ }));
    await expect(
      await menu.findByRole('button', { name: 'New skill' }),
    ).toBeInTheDocument();
    await userEvent.type(
      menu.getByRole('searchbox', { name: 'Search skills' }),
      'meet{Enter}',
    );

    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Meeting Prep')).toBeVisible();
    await waitFor(() => expect(canvas.getByRole('textbox')).toHaveFocus());
  },
};
