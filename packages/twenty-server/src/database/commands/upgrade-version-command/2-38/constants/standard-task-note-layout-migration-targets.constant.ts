import {
  getSystemViewFieldGroupUniversalIdentifier,
  getSystemViewFieldUniversalIdentifier,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';
import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';

type StandardPageLayoutIdentifiers = {
  universalIdentifier: string;
  tabs: Record<
    string,
    {
      universalIdentifier: string;
      widgets: Record<string, { universalIdentifier: string }>;
    }
  >;
};

type StandardFieldsViewIdentifiers = {
  universalIdentifier: string;
  viewFields: Record<string, { universalIdentifier: string }>;
  viewFieldGroups: Record<string, { universalIdentifier: string }>;
};

export type StandardTaskNoteLayoutMigrationTarget = {
  label: 'Task' | 'Note';
  pageLayoutUniversalIdentifier: string;
  fieldsViewUniversalIdentifier: string;
  preMigrationTabUniversalIdentifiers: readonly string[];
  postMigrationTabUniversalIdentifiers: readonly string[];
  preMigrationWidgetUniversalIdentifiers: readonly string[];
  postMigrationWidgetUniversalIdentifiers: readonly string[];
  preMigrationViewFieldUniversalIdentifiers: readonly string[];
  postMigrationViewFieldUniversalIdentifiers: readonly string[];
  preMigrationViewFieldGroupUniversalIdentifiers: readonly string[];
  postMigrationViewFieldGroupUniversalIdentifiers: readonly string[];
  removedTabUniversalIdentifiers: readonly string[];
  removedViewFieldUniversalIdentifiers: readonly string[];
  removedViewFieldGroupUniversalIdentifiers: readonly string[];
};

const getWidgetUniversalIdentifiers = (
  pageLayoutIdentifiers: StandardPageLayoutIdentifiers,
  tabUniversalIdentifiers: readonly string[],
) =>
  Object.values(pageLayoutIdentifiers.tabs)
    .filter(({ universalIdentifier }) =>
      tabUniversalIdentifiers.includes(universalIdentifier),
    )
    .flatMap(({ widgets }) =>
      Object.values(widgets).map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    );

const getLegacyViewFieldUniversalIdentifiers = ({
  fieldsViewUniversalIdentifier,
  removedFieldUniversalIdentifiers,
}: {
  fieldsViewUniversalIdentifier: string;
  removedFieldUniversalIdentifiers: readonly string[];
}) =>
  removedFieldUniversalIdentifiers.map((fieldMetadataUniversalIdentifier) =>
    getSystemViewFieldUniversalIdentifier({
      fieldMetadataApplicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier,
      viewUniversalIdentifier: fieldsViewUniversalIdentifier,
    }),
  );

const buildTargetLayout = ({
  label,
  pageLayoutIdentifiers,
  fieldsViewIdentifiers,
  removedTabUniversalIdentifiers,
  removedFieldUniversalIdentifiers,
}: {
  label: StandardTaskNoteLayoutMigrationTarget['label'];
  pageLayoutIdentifiers: StandardPageLayoutIdentifiers;
  fieldsViewIdentifiers: StandardFieldsViewIdentifiers;
  removedTabUniversalIdentifiers: readonly string[];
  removedFieldUniversalIdentifiers: readonly string[];
}): StandardTaskNoteLayoutMigrationTarget => {
  const preMigrationTabUniversalIdentifiers = Object.values(
    pageLayoutIdentifiers.tabs,
  ).map(({ universalIdentifier }) => universalIdentifier);
  const postMigrationTabUniversalIdentifiers =
    preMigrationTabUniversalIdentifiers.filter(
      (universalIdentifier) =>
        !removedTabUniversalIdentifiers.includes(universalIdentifier),
    );
  const postMigrationViewFieldUniversalIdentifiers = Object.values(
    fieldsViewIdentifiers.viewFields,
  ).map(({ universalIdentifier }) => universalIdentifier);
  const removedViewFieldUniversalIdentifiers =
    getLegacyViewFieldUniversalIdentifiers({
      fieldsViewUniversalIdentifier: fieldsViewIdentifiers.universalIdentifier,
      removedFieldUniversalIdentifiers,
    });
  const postMigrationViewFieldGroupUniversalIdentifiers = Object.values(
    fieldsViewIdentifiers.viewFieldGroups,
  ).map(({ universalIdentifier }) => universalIdentifier);
  const removedViewFieldGroupUniversalIdentifiers = [
    getSystemViewFieldGroupUniversalIdentifier({
      name: 'System',
      objectMetadataApplicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      viewUniversalIdentifier: fieldsViewIdentifiers.universalIdentifier,
    }),
  ];

  return {
    label,
    pageLayoutUniversalIdentifier: pageLayoutIdentifiers.universalIdentifier,
    fieldsViewUniversalIdentifier: fieldsViewIdentifiers.universalIdentifier,
    preMigrationTabUniversalIdentifiers,
    postMigrationTabUniversalIdentifiers,
    preMigrationWidgetUniversalIdentifiers: getWidgetUniversalIdentifiers(
      pageLayoutIdentifiers,
      preMigrationTabUniversalIdentifiers,
    ),
    postMigrationWidgetUniversalIdentifiers: getWidgetUniversalIdentifiers(
      pageLayoutIdentifiers,
      postMigrationTabUniversalIdentifiers,
    ),
    preMigrationViewFieldUniversalIdentifiers: [
      ...postMigrationViewFieldUniversalIdentifiers,
      ...removedViewFieldUniversalIdentifiers,
    ],
    postMigrationViewFieldUniversalIdentifiers,
    preMigrationViewFieldGroupUniversalIdentifiers: [
      ...postMigrationViewFieldGroupUniversalIdentifiers,
      ...removedViewFieldGroupUniversalIdentifiers,
    ],
    postMigrationViewFieldGroupUniversalIdentifiers,
    removedTabUniversalIdentifiers,
    removedViewFieldUniversalIdentifiers,
    removedViewFieldGroupUniversalIdentifiers,
  };
};

const TASK_LAYOUT_IDENTIFIERS =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.taskRecordPage;
const NOTE_LAYOUT_IDENTIFIERS =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.noteRecordPage;

export const STANDARD_TASK_NOTE_LAYOUT_MIGRATION_TARGETS: readonly StandardTaskNoteLayoutMigrationTarget[] =
  [
    buildTargetLayout({
      label: 'Task',
      pageLayoutIdentifiers: TASK_LAYOUT_IDENTIFIERS,
      fieldsViewIdentifiers: STANDARD_OBJECTS.task.views.taskRecordPageFields,
      removedTabUniversalIdentifiers: [
        TASK_LAYOUT_IDENTIFIERS.tabs.timeline.universalIdentifier,
        TASK_LAYOUT_IDENTIFIERS.tabs.files.universalIdentifier,
      ],
      removedFieldUniversalIdentifiers: [
        STANDARD_OBJECTS.task.fields.bodyV2.universalIdentifier,
        STANDARD_OBJECTS.task.fields.createdAt.universalIdentifier,
        STANDARD_OBJECTS.task.fields.createdBy.universalIdentifier,
        STANDARD_OBJECTS.task.fields.updatedAt.universalIdentifier,
        STANDARD_OBJECTS.task.fields.updatedBy.universalIdentifier,
      ],
    }),
    buildTargetLayout({
      label: 'Note',
      pageLayoutIdentifiers: NOTE_LAYOUT_IDENTIFIERS,
      fieldsViewIdentifiers: STANDARD_OBJECTS.note.views.noteRecordPageFields,
      removedTabUniversalIdentifiers: [
        NOTE_LAYOUT_IDENTIFIERS.tabs.timeline.universalIdentifier,
        NOTE_LAYOUT_IDENTIFIERS.tabs.files.universalIdentifier,
      ],
      removedFieldUniversalIdentifiers: [
        STANDARD_OBJECTS.note.fields.bodyV2.universalIdentifier,
        STANDARD_OBJECTS.note.fields.createdAt.universalIdentifier,
        STANDARD_OBJECTS.note.fields.createdBy.universalIdentifier,
        STANDARD_OBJECTS.note.fields.updatedAt.universalIdentifier,
        STANDARD_OBJECTS.note.fields.updatedBy.universalIdentifier,
      ],
    }),
  ];
