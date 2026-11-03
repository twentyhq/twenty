import { Logger } from '@nestjs/common';

import { DEFAULT_WIDGET_SIZE } from 'twenty-shared/constants';
import {
  FieldMetadataType,
  PageLayoutTabLayoutMode,
  ViewFilterOperand,
  WidgetType,
} from 'twenty-shared/types';

import { fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget } from 'src/engine/core-modules/application/application-manifest/converters/from-page-layout-widget-manifest-to-universal-flat-page-layout-widget.util';
import { type LegacyPageLayoutWidgetManifest } from 'src/engine/core-modules/application/application-manifest/types/legacy-page-layout-widget-manifest.type';
import { ApplicationException } from 'src/engine/core-modules/application/application.exception';

const OBJECT_UNIVERSAL_IDENTIFIER = 'obj-uuid-1';
const STAGE_FIELD_UNIVERSAL_IDENTIFIER = 'field-uuid-stage';
const OLDER_SDK_WARNING =
  'Built with an older SDK. Rebuild to remove this warning.';

const findObjectFieldByName = ({
  objectUniversalIdentifier,
  fieldName,
}: {
  objectUniversalIdentifier: string;
  fieldName: string;
}) =>
  objectUniversalIdentifier === OBJECT_UNIVERSAL_IDENTIFIER &&
  fieldName === 'stage'
    ? {
        universalIdentifier: STAGE_FIELD_UNIVERSAL_IDENTIFIER,
        type: FieldMetadataType.SELECT,
      }
    : undefined;

const buildLegacyWidgetManifest = (
  conditionalDisplay: Record<string, unknown>,
): LegacyPageLayoutWidgetManifest => ({
  universalIdentifier: 'widget-uuid-legacy',
  title: 'Deal Summary',
  type: WidgetType.IFRAME,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  conditionalDisplay,
  position: {
    layoutMode: PageLayoutTabLayoutMode.GRID,
    row: 0,
    column: 0,
    rowSpan: DEFAULT_WIDGET_SIZE.default.h,
    columnSpan: DEFAULT_WIDGET_SIZE.default.w,
  },
  configuration: {
    configurationType: 'IFRAME',
    url: 'https://example.com',
  },
});

describe('fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget', () => {
  const now = '2026-01-01T00:00:00.000Z';
  const applicationUniversalIdentifier = 'app-uuid-1';
  const pageLayoutTabUniversalIdentifier = 'tab-uuid-1';

  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
  });

  afterEach(() => warnSpy.mockRestore());

  const convertLegacyWidget = (conditionalDisplay: Record<string, unknown>) =>
    fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget({
      pageLayoutWidgetManifest: buildLegacyWidgetManifest(conditionalDisplay),
      pageLayoutTabUniversalIdentifier,
      applicationUniversalIdentifier,
      findObjectFieldByName,
      now,
    });

  it('should convert the json-logic field rule of an older build into a field tree with a warning', () => {
    const result = convertLegacyWidget({
      '==': [{ var: 'selectedRecords.0.stage' }, 'WON'],
    });

    expect(result.universalConditionalDisplay?.recordFilters).toEqual([
      expect.objectContaining({
        fieldMetadataUniversalIdentifier: STAGE_FIELD_UNIVERSAL_IDENTIFIER,
        operand: ViewFilterOperand.IS,
        value: JSON.stringify(['WON']),
      }),
    ]);
    expect(
      result.universalConditionalDisplay?.recordFilters?.[0],
    ).not.toHaveProperty('fieldMetadataId');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(OLDER_SDK_WARNING),
    );
  });

  it('should fail the install with the widget title when the json-logic of an older build cannot be converted', () => {
    const convertUnconvertibleWidget = () =>
      convertLegacyWidget({ '==': [1, 0] });

    expect(convertUnconvertibleWidget).toThrow(ApplicationException);
    expect(convertUnconvertibleWidget).toThrow('"Deal Summary"');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should convert a minimal page layout widget manifest', () => {
    const result = fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget({
      pageLayoutWidgetManifest: {
        universalIdentifier: 'widget-uuid-1',
        title: 'My Widget',
        type: WidgetType.VIEW,
        position: {
          layoutMode: PageLayoutTabLayoutMode.GRID,
          row: 0,
          column: 0,
          rowSpan: DEFAULT_WIDGET_SIZE.default.h,
          columnSpan: DEFAULT_WIDGET_SIZE.default.w,
        },
        configuration: { configurationType: 'VIEW' },
      },
      pageLayoutTabUniversalIdentifier,
      applicationUniversalIdentifier,
      findObjectFieldByName,
      now,
    });

    expect(result.universalIdentifier).toBe('widget-uuid-1');
    expect(result.applicationUniversalIdentifier).toBe(
      applicationUniversalIdentifier,
    );
    expect(result.pageLayoutTabUniversalIdentifier).toBe(
      pageLayoutTabUniversalIdentifier,
    );
    expect(result.title).toBe('My Widget');
    expect(result.type).toBe(WidgetType.VIEW);
    expect(result.objectMetadataUniversalIdentifier).toBeNull();
    expect(result.universalConditionalDisplay).toBeNull();
    expect(result.position).toEqual({
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 0,
      column: 0,
      rowSpan: DEFAULT_WIDGET_SIZE.default.h,
      columnSpan: DEFAULT_WIDGET_SIZE.default.w,
    });
    expect(result.universalConfiguration).toEqual({
      configurationType: 'VIEW',
    });
  });

  it('should convert a fully specified page layout widget manifest', () => {
    const result = fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget({
      pageLayoutWidgetManifest: {
        universalIdentifier: 'widget-uuid-2',
        title: 'Iframe Widget',
        type: WidgetType.IFRAME,
        position: {
          layoutMode: PageLayoutTabLayoutMode.GRID,
          row: 0,
          column: 0,
          rowSpan: DEFAULT_WIDGET_SIZE.default.h,
          columnSpan: DEFAULT_WIDGET_SIZE.default.w,
        },
        objectUniversalIdentifier: 'obj-uuid-1',
        configuration: {
          configurationType: 'IFRAME',
          url: 'https://example.com',
        },
      },
      pageLayoutTabUniversalIdentifier,
      applicationUniversalIdentifier,
      findObjectFieldByName,
      now,
    });

    expect(result.title).toBe('Iframe Widget');
    expect(result.type).toBe('IFRAME');
    expect(result.objectMetadataUniversalIdentifier).toBe('obj-uuid-1');
    expect(result.position).toEqual({
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 0,
      column: 0,
      rowSpan: DEFAULT_WIDGET_SIZE.default.h,
      columnSpan: DEFAULT_WIDGET_SIZE.default.w,
    });
    expect(result.universalConfiguration).toEqual({
      configurationType: 'IFRAME',
      url: 'https://example.com',
    });
  });

  it('should use manifest position when provided', () => {
    const result = fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget({
      pageLayoutWidgetManifest: {
        universalIdentifier: 'widget-uuid-3',
        title: 'Positioned Widget',
        type: WidgetType.GRAPH,
        position: {
          layoutMode: PageLayoutTabLayoutMode.GRID,
          row: 2,
          column: 6,
          rowSpan: 4,
          columnSpan: 6,
        },
        configuration: { configurationType: 'VIEW' },
      },
      pageLayoutTabUniversalIdentifier,
      applicationUniversalIdentifier,
      findObjectFieldByName,
      now,
    });

    expect(result.position).toEqual({
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 2,
      column: 6,
      rowSpan: 4,
      columnSpan: 6,
    });
  });
});
