import { ViewType } from 'twenty-shared/types';

import { buildInboxThreadViewFieldsToCreate } from 'src/engine/metadata-modules/agent-chat-channel/utils/build-inbox-thread-view-fields-to-create.util';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { INBOX_THREAD_LIST_VIEW_UNIVERSAL_PROPERTIES } from 'src/engine/workspace-manager/twenty-standard-application/constants/inbox-thread-list-view-universal-properties.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

export const buildInboxViewToListViewOperations = <
  TFlatView extends Pick<
    FlatView,
    'universalIdentifier' | 'applicationUniversalIdentifier' | 'type'
  >,
  TStandardFlatViewField extends Pick<FlatViewField, 'viewUniversalIdentifier'>,
>({
  flatViews,
  standardFlatViewFields,
  workspaceCustomApplicationUniversalIdentifier,
  now,
}: {
  flatViews: TFlatView[];
  standardFlatViewFields: TStandardFlatViewField[];
  workspaceCustomApplicationUniversalIdentifier: string;
  now: string;
}) => {
  const inboxFlatViews = flatViews.filter(
    ({ type }) => type === ViewType.INBOX,
  );

  const isStandardFlatView = ({ applicationUniversalIdentifier }: TFlatView) =>
    applicationUniversalIdentifier ===
    TWENTY_STANDARD_APPLICATION.universalIdentifier;

  const standardInboxFlatViews = inboxFlatViews.filter(isStandardFlatView);

  const channelInboxFlatViews = inboxFlatViews.filter(
    (inboxFlatView) => !isStandardFlatView(inboxFlatView),
  );

  const turnIntoListView = (inboxFlatView: TFlatView) => ({
    ...inboxFlatView,
    ...INBOX_THREAD_LIST_VIEW_UNIVERSAL_PROPERTIES,
    updatedAt: now,
  });

  return [
    {
      writerApplicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
      viewsToUpdate: standardInboxFlatViews.map(turnIntoListView),
      viewFieldsToCreate: standardFlatViewFields.filter(
        ({ viewUniversalIdentifier }) =>
          standardInboxFlatViews.some(
            ({ universalIdentifier }) =>
              universalIdentifier === viewUniversalIdentifier,
          ),
      ),
    },
    {
      writerApplicationUniversalIdentifier:
        workspaceCustomApplicationUniversalIdentifier,
      viewsToUpdate: channelInboxFlatViews.map(turnIntoListView),
      viewFieldsToCreate: channelInboxFlatViews.flatMap(
        ({ universalIdentifier }) =>
          buildInboxThreadViewFieldsToCreate({
            viewUniversalIdentifier: universalIdentifier,
            applicationUniversalIdentifier:
              workspaceCustomApplicationUniversalIdentifier,
            createdAt: now,
          }),
      ),
    },
  ].filter(({ viewsToUpdate }) => viewsToUpdate.length > 0);
};
