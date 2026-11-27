import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { GET_ROLES } from '@/settings/roles/graphql/queries/getRolesQuery';
import { WidgetVisibilitySettings } from '@/side-panel/pages/page-layout/components/WidgetVisibilitySettings';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  buildDeviceConditionalEvaluationNode,
  type ConditionalEvaluationNode,
} from 'twenty-shared/conditional-evaluation';
import { isDefined } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedRoles } from '~/testing/mock-data/generated/metadata/roles/mock-roles-data';
import { getOperationName } from '~/utils/getOperationName';

const PAGE_LAYOUT_ID = 'widget-visibility-settings-story';
const TAB_ID = 'tab';
const WIDGET_ID = 'widget';
const ADMIN_ROLE_UNIVERSAL_IDENTIFIER = 'admin-role-universal-identifier';

const ROLES = mockedRoles.map((role) => ({
  ...role,
  universalIdentifier:
    role.label === 'Admin'
      ? ADMIN_ROLE_UNIVERSAL_IDENTIFIER
      : `${role.id}-universal-identifier`,
}));

const initializeWidget = (
  conditionalAvailability: ConditionalEvaluationNode | null,
) =>
  jotaiStore.set(
    pageLayoutDraftComponentState.atomFamily({ instanceId: PAGE_LAYOUT_ID }),
    makeDraft([
      makeTab(TAB_ID, [
        { ...makeWidget(WIDGET_ID, 0, TAB_ID), conditionalAvailability },
      ]),
    ]),
  );

const getWidgetConditionalAvailability = () =>
  jotaiStore.get(
    pageLayoutDraftComponentState.atomFamily({ instanceId: PAGE_LAYOUT_ID }),
  ).tabs[0]?.widgets[0]?.conditionalAvailability;

const WidgetVisibilitySettingsStory = () => {
  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    PAGE_LAYOUT_ID,
  );
  const widget = pageLayoutDraft.tabs[0]?.widgets[0];

  if (!isDefined(widget)) {
    return null;
  }

  return (
    <WidgetVisibilitySettings pageLayoutId={PAGE_LAYOUT_ID} widget={widget} />
  );
};

const meta: Meta<typeof WidgetVisibilitySettingsStory> = {
  title: 'Modules/SidePanel/PageLayout/WidgetVisibilitySettings',
  component: WidgetVisibilitySettingsStory,
  decorators: [
    ObjectMetadataItemsDecorator,
    ComponentDecorator,
    WorkspaceDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
  ],
  parameters: {
    container: { width: 400 },
    msw: {
      handlers: [
        graphql.query(getOperationName(GET_ROLES) ?? '', () =>
          HttpResponse.json({ data: { getRoles: ROLES } }),
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Everyone: Story = {
  beforeEach: () => initializeWidget(null),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Everyone')).toBeVisible();
    await expect(canvas.queryByText('Where')).toBeNull();
  },
};

export const CustomRuleOnRole: Story = {
  beforeEach: () => initializeWidget(null),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvas.findByText('Everyone'));
    await userEvent.click(await body.findByText('Custom rule'));

    await expect(await canvas.findByText('Where')).toBeVisible();
    await expect(getWidgetConditionalAvailability()).toBeNull();

    await userEvent.click(await canvas.findByText('Select roles'));
    await userEvent.click(await body.findByRole('option', { name: 'Admin' }));

    await waitFor(() =>
      expect(getWidgetConditionalAvailability()).toEqual({
        type: 'COMPARISON',
        operator: 'EQUAL',
        left: { type: 'VARIABLE', path: 'currentRole.universalIdentifier' },
        right: { type: 'LITERAL', value: ADMIN_ROLE_UNIVERSAL_IDENTIFIER },
      }),
    );
  },
};

export const StoredRuleBackToEveryone: Story = {
  beforeEach: () =>
    initializeWidget(buildDeviceConditionalEvaluationNode('MOBILE')),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await expect(await canvas.findByText('Device')).toBeVisible();
    await expect(await canvas.findByText('Mobile')).toBeVisible();

    await userEvent.click(await canvas.findByText('Custom rule'));
    await userEvent.click(await body.findByText('Everyone'));

    await waitFor(() => expect(getWidgetConditionalAvailability()).toBeNull());
    await expect(canvas.queryByText('Where')).toBeNull();
  },
};

export const RuleThatCannotBeEdited: Story = {
  beforeEach: () =>
    initializeWidget({
      type: 'FUNCTION_CALL',
      functionName: 'isDefined',
      arguments: [{ type: 'VARIABLE', path: 'device' }],
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Custom rule')).toBeVisible();
    await expect(
      await canvas.findByText(
        'This rule cannot be edited here. Select Everyone to remove it.',
      ),
    ).toBeVisible();
    await expect(canvas.queryByText('Where')).toBeNull();
  },
};
