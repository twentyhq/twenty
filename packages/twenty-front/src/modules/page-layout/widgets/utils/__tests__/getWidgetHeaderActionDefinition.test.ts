import { getWidgetHeaderActionDefinition } from '@/page-layout/widgets/utils/getWidgetHeaderActionDefinition';
import {
  FieldDisplayMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

describe('getWidgetHeaderActionDefinition', () => {
  it('returns the registered action component for a built-in widget', () => {
    const definition = getWidgetHeaderActionDefinition({
      type: WidgetType.FIELD,
      configuration: {
        __typename: 'FieldConfiguration',
        configurationType: WidgetConfigurationType.FIELD,
        fieldMetadataId: 'field-metadata-id',
        fieldDisplayMode: FieldDisplayMode.FIELD,
      },
    });

    expect(definition?.kind).toBe('component');
  });

  it('returns configured command menu items for a front component widget', () => {
    const definition = getWidgetHeaderActionDefinition({
      type: WidgetType.FRONT_COMPONENT,
      configuration: {
        __typename: 'FrontComponentConfiguration',
        configurationType: WidgetConfigurationType.FRONT_COMPONENT,
        frontComponentId: 'front-component-id',
        headerCommandMenuItemUniversalIdentifiers: [
          'command-menu-item-universal-identifier',
        ],
      },
    });

    expect(definition).toEqual({
      kind: 'command-menu-items',
      commandMenuItemUniversalIdentifiers: [
        'command-menu-item-universal-identifier',
      ],
    });
  });

  it('returns no action for a front component without command menu items', () => {
    const definition = getWidgetHeaderActionDefinition({
      type: WidgetType.FRONT_COMPONENT,
      configuration: {
        __typename: 'FrontComponentConfiguration',
        configurationType: WidgetConfigurationType.FRONT_COMPONENT,
        frontComponentId: 'front-component-id',
        headerCommandMenuItemUniversalIdentifiers: [],
      },
    });

    expect(definition).toBeUndefined();
  });

  it('returns no action for an actionless widget', () => {
    const definition = getWidgetHeaderActionDefinition({
      type: WidgetType.CALL_RECORDING_SUMMARY,
      configuration: {
        __typename: 'CallRecordingSummaryConfiguration',
        configurationType: WidgetConfigurationType.CALL_RECORDING_SUMMARY,
      },
    });

    expect(definition).toBeUndefined();
  });
});
