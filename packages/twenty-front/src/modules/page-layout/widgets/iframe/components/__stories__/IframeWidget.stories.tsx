import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { MediaAccessIndicator } from '@/media-access/components/MediaAccessIndicator';
import { PageLayoutEditModeProviderContext } from '@/page-layout/contexts/PageLayoutEditModeContext';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { IframeWidget } from '@/page-layout/widgets/iframe/components/IframeWidget';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { createStore, Provider } from 'jotai';
import { graphql, HttpResponse } from 'msw';
import { useState } from 'react';
import {
  expect,
  fn,
  mocked,
  spyOn,
  userEvent,
  waitFor,
  within,
} from 'storybook/test';
import { IFRAME_MEDIA_PERMISSIONS_BOOTSTRAP_ELEMENT_ID } from 'twenty-shared/constants';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  GetIframeWidgetMediaPermissionsDocument,
  type GetIframeWidgetMediaPermissionsQuery,
  type GetIframeWidgetMediaPermissionsQueryVariables,
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

const APPLICATION_ID = 'phone-application';
const APPLICATION_NAME = 'Phone app';
const WORKSPACE_APPLICATION_ID = 'workspace-custom-application';
const APP_WIDGET_ID = 'app-phone-widget';
const FOREIGN_ORIGIN_WIDGET_ID = 'app-workspace-origin-widget';
const WORKSPACE_WIDGET_ID = 'workspace-phone-widget';
const WIDGET_TITLE = 'Phone widget';
const APPLICATION_PERMISSION = {
  origin: 'https://example.com',
  microphone: true,
  camera: false,
};
const WORKSPACE_PERMISSION = {
  origin: 'https://workspace.example.com',
  microphone: true,
  camera: false,
};
const permissionRequest = fn();

type IframeWidgetStoryProps = {
  widgetId: string;
  applicationId: string;
  url: string;
};

const IframeWidgetStory = ({
  widgetId,
  applicationId,
  url,
}: IframeWidgetStoryProps) => {
  const [store] = useState(() => {
    const storyStore = createStore();

    storyStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      workspaceCustomApplication: { id: WORKSPACE_APPLICATION_ID },
      iframeMediaPermissions: [WORKSPACE_PERMISSION],
    });

    return storyStore;
  });
  const widget: PageLayoutWidget = {
    __typename: 'PageLayoutWidget',
    id: widgetId,
    applicationId,
    universalIdentifier: widgetId,
    pageLayoutTabId: 'phone-tab',
    title: WIDGET_TITLE,
    type: WidgetType.IFRAME,
    configuration: {
      __typename: 'IframeConfiguration',
      configurationType: WidgetConfigurationType.IFRAME,
      url,
    },
    position: {
      __typename: 'PageLayoutWidgetGridPosition',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 0,
      column: 0,
      rowSpan: 4,
      columnSpan: 4,
    },
    isActive: true,
    isSystemSideEffect: false,
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
    deletedAt: null,
  };

  return (
    <Provider store={store}>
      <script
        id={IFRAME_MEDIA_PERMISSIONS_BOOTSTRAP_ELEMENT_ID}
        type="application/json"
      >
        {JSON.stringify([APPLICATION_PERMISSION, WORKSPACE_PERMISSION])}
      </script>
      <PageLayoutEditModeProviderContext value={{ isInEditMode: false }}>
        <MediaAccessIndicator />
        <div style={{ width: 500, height: 250 }}>
          <IframeWidget widget={widget} />
        </div>
      </PageLayoutEditModeProviderContext>
    </Provider>
  );
};

const meta: Meta<typeof IframeWidgetStory> = {
  title: 'Modules/PageLayout/Widgets/IframeWidget',
  component: IframeWidgetStory,
  decorators: [RootDecorator, ComponentDecorator],
  args: {
    widgetId: APP_WIDGET_ID,
    applicationId: APPLICATION_ID,
    url: APPLICATION_PERMISSION.origin,
  },
  beforeEach: () => {
    permissionRequest.mockClear();
    const confirm = spyOn(window, 'confirm').mockReturnValue(true);

    return () => confirm.mockRestore();
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query<
          GetIframeWidgetMediaPermissionsQuery,
          GetIframeWidgetMediaPermissionsQueryVariables
        >('GetIframeWidgetMediaPermissions', ({ variables }) => {
          permissionRequest(variables);

          return HttpResponse.json({
            data: {
              getPageLayoutWidget: {
                __typename: 'PageLayoutWidget',
                id: variables.id,
                applicationId: APPLICATION_ID,
                applicationName: APPLICATION_NAME,
                applicationGrantedIframeMediaPermissions: [
                  {
                    __typename: 'IframeMediaPermission',
                    ...APPLICATION_PERMISSION,
                  },
                ],
              },
            },
          });
        }),
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof IframeWidgetStory>;

export const ConfirmsOwningApplicationAccess: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const initialFrame = canvas.getByTitle(WIDGET_TITLE);
    const confirm = mocked(window.confirm).mockReturnValueOnce(false);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Enable microphone' }),
    );

    await expect(confirm).toHaveBeenCalledTimes(1);
    await expect(confirm).toHaveBeenLastCalledWith(
      `Enable media access for ${APPLICATION_NAME}?\nEnable microphone\n${APPLICATION_PERMISSION.origin}`,
    );
    await expect(canvas.getByTitle(WIDGET_TITLE)).toBe(initialFrame);
    await expect(initialFrame).toHaveAttribute(
      'allow',
      "microphone 'none'; camera 'none'; encrypted-media",
    );

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Enable microphone' }),
    );

    await expect(confirm).toHaveBeenCalledTimes(2);
    await expect(canvas.getByTitle(WIDGET_TITLE)).not.toBe(initialFrame);
    await expect(canvas.getByTitle(WIDGET_TITLE)).toHaveAttribute(
      'allow',
      `microphone ${APPLICATION_PERMISSION.origin}; camera 'none'; encrypted-media`,
    );
  },
};

export const DoesNotInheritWorkspaceGrants: Story = {
  args: {
    widgetId: FOREIGN_ORIGIN_WIDGET_ID,
    url: WORKSPACE_PERMISSION.origin,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() =>
      expect(
        mockedApolloClient.cache.readQuery({
          query: GetIframeWidgetMediaPermissionsDocument,
          variables: { id: FOREIGN_ORIGIN_WIDGET_ID },
        })?.getPageLayoutWidget?.applicationName,
      ).toBe(APPLICATION_NAME),
    );
    await expect(
      canvas.queryByRole('button', { name: 'Enable microphone' }),
    ).not.toBeInTheDocument();
    await expect(canvas.getByTitle(WIDGET_TITLE)).toHaveAttribute(
      'allow',
      "microphone 'none'; camera 'none'; encrypted-media",
    );
    await expect(window.confirm).not.toHaveBeenCalled();
  },
};

export const WorkspaceWidgetUsesWorkspaceGrants: Story = {
  args: {
    widgetId: WORKSPACE_WIDGET_ID,
    applicationId: WORKSPACE_APPLICATION_ID,
    url: WORKSPACE_PERMISSION.origin,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Enable microphone' }),
    );

    await expect(window.confirm).toHaveBeenCalledTimes(1);
    await expect(window.confirm).toHaveBeenLastCalledWith(
      `Enable media access for ${WIDGET_TITLE}?\nEnable microphone\n${WORKSPACE_PERMISSION.origin}`,
    );
    await expect(canvas.getByTitle(WIDGET_TITLE)).toHaveAttribute(
      'allow',
      `microphone ${WORKSPACE_PERMISSION.origin}; camera 'none'; encrypted-media`,
    );
    await expect(permissionRequest).not.toHaveBeenCalled();
  },
};
