import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { EditorContent } from '@tiptap/react';
import { graphql, HttpResponse } from 'msw';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
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
                  description: 'Builds a brief before your next meeting.',
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

export const IgnoreEnterOnOutdatedRecords: Story = {
  play: async ({ canvasElement }) => {
    const menu = await openAddMenu(canvasElement);

    await userEvent.click(menu.getByRole('menuitem', { name: /Records/ }));
    await menu.findByRole('button', { name: /Jeffery Griffin/ });

    const searchbox = menu.getByRole('searchbox', { name: 'Search records' });
    await userEvent.type(searchbox, 'ter{Enter}');

    await expect(searchbox).toHaveFocus();
    await expect(
      within(within(canvasElement).getByRole('textbox')).queryByText(
        'Jeffery Griffin',
      ),
    ).not.toBeInTheDocument();
  },
};

export const InsertSkill: Story = {
  play: async ({ canvasElement }) => {
    const menu = await openAddMenu(canvasElement);

    await userEvent.click(menu.getByRole('menuitem', { name: /Skills/ }));
    await expect(
      await menu.findByRole('button', { name: 'New skill' }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        menu.getByRole('button', { name: 'Meeting Prep' }),
      ).not.toHaveAttribute('aria-disabled'),
    );
    await userEvent.type(
      menu.getByRole('searchbox', { name: 'Search skills' }),
      'meet{Enter}',
    );

    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Meeting Prep')).toBeVisible();
    await waitFor(() => expect(canvas.getByRole('textbox')).toHaveFocus());
  },
};

export const PreviewSkill: Story = {
  play: async ({ canvasElement }) => {
    const menu = await openAddMenu(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(menu.getByRole('menuitem', { name: /Skills/ }));
    const meetingPrep = await menu.findByRole('button', {
      name: 'Meeting Prep',
    });
    await waitFor(() =>
      expect(meetingPrep).not.toHaveAttribute('aria-disabled'),
    );

    await userEvent.hover(meetingPrep);
    await expect(await body.findByRole('tooltip')).toHaveTextContent(
      'Builds a brief before your next meeting.',
    );

    await userEvent.unhover(meetingPrep);
    await waitFor(() =>
      expect(body.queryByRole('tooltip')).not.toBeInTheDocument(),
    );

    await userEvent.type(
      menu.getByRole('searchbox', { name: 'Search skills' }),
      'meet',
    );
    await expect(await body.findByRole('tooltip')).toHaveTextContent(
      '/meeting-prep',
    );
  },
};

const SCROLLABLE_SKILLS = Array.from({ length: 10 }, (_, index) => {
  const skillNumber = String(index + 1).padStart(2, '0');

  return {
    __typename: 'Skill',
    id: `20202020-0000-4000-8000-0000000000${skillNumber}`,
    name: `skill-${skillNumber}`,
    label: `Skill ${skillNumber}`,
    description: `Runs skill ${skillNumber}.`,
    icon: 'IconBook',
    isActive: true,
    isSystem: false,
  };
});

export const HideScrolledOutSkillPreview: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindManySkillsForSuggestion', () =>
          HttpResponse.json({ data: { skills: SCROLLABLE_SKILLS } }),
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const menu = await openAddMenu(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(menu.getByRole('menuitem', { name: /Skills/ }));
    const firstSkill = await menu.findByRole('button', { name: 'Skill 01' });
    await waitFor(() =>
      expect(firstSkill).not.toHaveAttribute('aria-disabled'),
    );

    await userEvent.type(
      menu.getByRole('searchbox', { name: 'Search skills' }),
      'skill',
    );
    const preview = await body.findByRole('tooltip');
    await expect(preview).toHaveTextContent('/skill-01');

    const skillList = firstSkill.closest('[data-scrollable]');
    if (isDefined(skillList)) {
      fireEvent.scroll(skillList, {
        target: { scrollTop: skillList.scrollHeight },
      });
    }

    await waitFor(() => expect(preview).not.toBeVisible());
  },
};
