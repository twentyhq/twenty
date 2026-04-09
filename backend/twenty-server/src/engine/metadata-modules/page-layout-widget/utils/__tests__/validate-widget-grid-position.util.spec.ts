import { WIDGET_GRID_MAX_COLUMNS } from 'src/engine/metadata-modules/page-layout-widget/constants/widget-grid-max-columns.constant';
import { WIDGET_GRID_MAX_ROWS } from 'src/engine/metadata-modules/page-layout-widget/constants/widget-grid-max-rows.constant';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { validateWidgetGridPosition } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-widget-grid-position.util';

describe('validateWidgetGridPosition', () => {
  const validGridPosition = {
    row: 0,
    column: 0,
    rowSpan: 2,
    columnSpan: 3,
  };

  describe('Valid grid positions', () => {
    it('should return empty array for valid grid position', () => {
      const errors = validateWidgetGridPosition(
        validGridPosition,
        'Test Widget',
      );

      expect(errors).toEqual([]);
    });

    it('should return empty array for widget at max column boundary', () => {
      const errors = validateWidgetGridPosition(
        {
          row: 0,
          column: WIDGET_GRID_MAX_COLUMNS - 1,
          rowSpan: 1,
          columnSpan: 1,
        },
        'Test Widget',
      );

      expect(errors).toEqual([]);
    });

    it('should return empty array for widget at max row boundary', () => {
      const errors = validateWidgetGridPosition(
        {
          row: WIDGET_GRID_MAX_ROWS - 1,
          column: 0,
          rowSpan: 1,
          columnSpan: 1,
        },
        'Test Widget',
      );

      expect(errors).toEqual([]);
    });

    it('should return empty array for widget spanning to column grid edge', () => {
      const errors = validateWidgetGridPosition(
        {
          row: 0,
          column: 8,
          rowSpan: 1,
          columnSpan: 4,
        },
        'Test Widget',
      );

      expect(errors).toEqual([]);
    });

    it('should return empty array for widget spanning to row grid edge', () => {
      const errors = validateWidgetGridPosition(
        {
          row: WIDGET_GRID_MAX_ROWS - 5,
          column: 0,
          rowSpan: 5,
          columnSpan: 6,
        },
        'Test Widget',
      );

      expect(errors).toEqual([]);
    });
  });

  describe('Invalid row positions', () => {
    it('should return error for row exceeding max rows', () => {
      const errors = validateWidgetGridPosition(
        { ...validGridPosition, row: WIDGET_GRID_MAX_ROWS },
        'Test Widget',
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].code).toBe(
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    });

    it('should return error when widget extends beyond grid height', () => {
      const errors = validateWidgetGridPosition(
        {
          row: WIDGET_GRID_MAX_ROWS - 2,
          column: 0,
          rowSpan: 5,
          columnSpan: 6,
        },
        'Test Widget',
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((error) =>
          error.message.includes('extends beyond grid height'),
        ),
      ).toBe(true);
    });
  });

  describe('Invalid column positions', () => {
    it('should return error for column exceeding max columns', () => {
      const errors = validateWidgetGridPosition(
        { ...validGridPosition, column: WIDGET_GRID_MAX_COLUMNS },
        'Test Widget',
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].code).toBe(
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    });
  });

  describe('Widget extending beyond grid', () => {
    it('should return error when widget extends beyond grid width', () => {
      const errors = validateWidgetGridPosition(
        {
          row: 0,
          column: 10,
          rowSpan: 1,
          columnSpan: 3,
        },
        'Test Widget',
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((error) =>
          error.message.includes('extends beyond grid width'),
        ),
      ).toBe(true);
    });
  });

  describe('Error messages', () => {
    it('should include max columns value in error', () => {
      const errors = validateWidgetGridPosition(
        {
          row: 0,
          column: 10,
          rowSpan: 1,
          columnSpan: 5,
        },
        'Test Widget',
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((error) =>
          error.message.includes(WIDGET_GRID_MAX_COLUMNS.toString()),
        ),
      ).toBe(true);
    });

    it('should include max rows value in error for row start', () => {
      const errors = validateWidgetGridPosition(
        {
          row: WIDGET_GRID_MAX_ROWS + 10,
          column: 0,
          rowSpan: 1,
          columnSpan: 1,
        },
        'Test Widget',
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((error) =>
          error.message.includes(WIDGET_GRID_MAX_ROWS.toString()),
        ),
      ).toBe(true);
    });

    it('should include max rows value in error for row extension', () => {
      const errors = validateWidgetGridPosition(
        {
          row: 95,
          column: 0,
          rowSpan: 10,
          columnSpan: 6,
        },
        'Test Widget',
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((error) =>
          error.message.includes(WIDGET_GRID_MAX_ROWS.toString()),
        ),
      ).toBe(true);
    });

    it('should include widget title in error message', () => {
      const errors = validateWidgetGridPosition(
        {
          row: WIDGET_GRID_MAX_ROWS,
          column: 0,
          rowSpan: 1,
          columnSpan: 1,
        },
        'My Custom Widget',
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((error) => error.message.includes('My Custom Widget')),
      ).toBe(true);
    });
  });
});
