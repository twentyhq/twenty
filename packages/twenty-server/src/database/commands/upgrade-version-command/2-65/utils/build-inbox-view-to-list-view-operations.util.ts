import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { ViewType } from 'twenty-shared/types';

import { buildInboxThreadViewFieldsToCreate } from 'src/engine/metadata-modules/agent-chat-channel/utils/build-inbox-thread-view-fields-to-create.util';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { INBOX_THREAD_LIST_VIEW_UNIVERSAL_PROPERTIES } from 'src/engine/workspace-manager/twenty-standard-application/constants/inbox-thread-list-view-universal-properties.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

type ConvertibleFlatView = Pick<
  FlatView,
  | 'universalIdentifier'
  | 'applicationUniversalIdentifier'
  | 'type'
  | 'isCompact'
  | 'listPinnedFieldMetadataUniversalIdentifier'
  | 'updatedAt'
>;

type ViewFieldPlacement = Pick<
  FlatViewField,
  'viewUniversalIdentifier' | 'fieldMetadataUniversalIdentifier' | 'position'
>;

type InboxViewToListViewOperations<
  TFlatView extends ConvertibleFlatView,
  TStandardFlatViewField extends ViewFieldPlacement,
> = {
  writerApplicationUniversalIdentifier: string;
  viewsToUpdate: TFlatView[];
  viewFieldsToCreate: (TStandardFlatViewField | UniversalFlatViewField)[];
};

const STANDARD_INBOX_THREAD_VIEW_UNIVERSAL_IDENTIFIERS: string[] =
  Object.values(STANDARD_OBJECTS.agentChatThread.views).map(
    ({ universalIdentifier }) => universalIdentifier,
  );

export const buildInboxViewToListViewOperations = <
  TFlatView extends ConvertibleFlatView,
  TStandardFlatViewField extends ViewFieldPlacement,
>({
  flatViews,
  flatViewFields,
  standardFlatViewFields,
  now,
}: {
  flatViews: TFlatView[];
  flatViewFields: ViewFieldPlacement[];
  standardFlatViewFields: TStandardFlatViewField[];
  now: string;
}): InboxViewToListViewOperations<TFlatView, TStandardFlatViewField>[] => {
  const standardInboxThreadFlatViews = flatViews.filter(
    ({ universalIdentifier }) =>
      STANDARD_INBOX_THREAD_VIEW_UNIVERSAL_IDENTIFIERS.includes(
        universalIdentifier,
      ),
  );

  const inboxFlatViews = flatViews.filter(
    ({ type }) => type === ViewType.INBOX,
  );

  const findFlatViewFieldsOfView = (viewUniversalIdentifier: string) =>
    flatViewFields.filter(
      (flatViewField) =>
        flatViewField.viewUniversalIdentifier === viewUniversalIdentifier,
    );

  const standardViewFieldsToCreate = standardFlatViewFields.filter(
    (standardFlatViewField) =>
      standardInboxThreadFlatViews.some(
        ({ universalIdentifier }) =>
          universalIdentifier === standardFlatViewField.viewUniversalIdentifier,
      ) &&
      !findFlatViewFieldsOfView(
        standardFlatViewField.viewUniversalIdentifier,
      ).some(
        ({ fieldMetadataUniversalIdentifier }) =>
          fieldMetadataUniversalIdentifier ===
          standardFlatViewField.fieldMetadataUniversalIdentifier,
      ),
  );

  const writerApplicationUniversalIdentifiers = new Set([
    ...inboxFlatViews.map(
      ({ applicationUniversalIdentifier }) => applicationUniversalIdentifier,
    ),
    ...(standardViewFieldsToCreate.length > 0
      ? [TWENTY_STANDARD_APPLICATION.universalIdentifier]
      : []),
  ]);

  const buildViewFieldsToCreateForWriterApplication = ({
    writerApplicationUniversalIdentifier,
    writerInboxFlatViews,
  }: {
    writerApplicationUniversalIdentifier: string;
    writerInboxFlatViews: TFlatView[];
  }): (TStandardFlatViewField | UniversalFlatViewField)[] => {
    if (
      writerApplicationUniversalIdentifier ===
      TWENTY_STANDARD_APPLICATION.universalIdentifier
    ) {
      return standardViewFieldsToCreate;
    }

    return writerInboxFlatViews.flatMap(({ universalIdentifier }) =>
      buildInboxThreadViewFieldsToCreate({
        viewUniversalIdentifier: universalIdentifier,
        applicationUniversalIdentifier: writerApplicationUniversalIdentifier,
        existingViewFields: findFlatViewFieldsOfView(universalIdentifier),
        createdAt: now,
      }),
    );
  };

  return [...writerApplicationUniversalIdentifiers].map(
    (writerApplicationUniversalIdentifier) => {
      const writerInboxFlatViews = inboxFlatViews.filter(
        ({ applicationUniversalIdentifier }) =>
          applicationUniversalIdentifier ===
          writerApplicationUniversalIdentifier,
      );

      return {
        writerApplicationUniversalIdentifier,
        viewsToUpdate: writerInboxFlatViews.map((inboxFlatView) => ({
          ...inboxFlatView,
          ...INBOX_THREAD_LIST_VIEW_UNIVERSAL_PROPERTIES,
          updatedAt: now,
        })),
        viewFieldsToCreate: buildViewFieldsToCreateForWriterApplication({
          writerApplicationUniversalIdentifier,
          writerInboxFlatViews,
        }),
      };
    },
  );
};
