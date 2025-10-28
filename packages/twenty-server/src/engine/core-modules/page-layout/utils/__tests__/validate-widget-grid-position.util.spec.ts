import { WIDGET_GRID_MAX_COLUMNS } from 'src/engine/core-modules/page-layout/constants/widget-grid-max-columns.constant';
import { WIDGET_GRID_MAX_ROWS } from 'src/engine/core-modules/page-layout/constants/widget-grid-max-rows.constant';
import { PageLayoutWidgetException } from 'src/engine/core-modules/page-layout/exceptions/page-layout-widget.exception';
import { validateWidgetGridPosition } from 'src/engine/core-modules/page-layout/utils/validate-widget-grid-position.util';

describe('validateWidgetGridPosition', () => {
  const validGridPosition = {
    row: 0,
    column: 0,
    rowSpan: 2,
    columnSpan: 3,
  };

  describe('Valid grid positions', () => {
    it('should not throw for valid grid position', () => {
      expect(() =>
        validateWidgetGridPosition(validGridPosition, 'Test Widget'),
      ).not.toThrow();
    });

    it('should not throw for widget at max column boundary', () => {
      expect(() =>
        validateWidgetGridPosition(
          {
            row: 0,
            column: WIDGET_GRID_MAX_COLUMNS - 1,
            rowSpan: 1,
            columnSpan: 1,
          },
          'Test Widget',
        ),
      ).not.toThrow();
    });

    it('should not throw for widget at max row boundary', () => {
      expect(() =>
        validateWidgetGridPosition(
          {
            row: WIDGET_GRID_MAX_ROWS - 1,
            column: 0,
            rowSpan: 1,
            columnSpan: 1,
          },
          'Test Widget',
        ),
      ).not.toThrow();
    });

    it('should not throw for widget spanning to grid edge', () => {
      expect(() =>
        validateWidgetGridPosition(
          {
            row: 0,
            column: 8,
            rowSpan: 1,
            columnSpan: 4,
          },
          'Test Widget',
        ),
      ).not.toThrow();
    });
  });

  describe('Invalid row positions', () => {
    it('should throw for negative row', () => {
      expect(() =>
        validateWidgetGridPosition(
          { ...validGridPosition, row: -1 },
          'Test Widget',
        ),
      ).toThrow(PageLayoutWidgetException);
    });

    it('should throw for row exceeding max rows', () => {
      expect(() =>
        validateWidgetGridPosition(
          { ...validGridPosition, row: WIDGET_GRID_MAX_ROWS },
          'Test Widget',
        ),
      ).toThrow(PageLayoutWidgetException);
    });

    it('should include widget title in error message for negative row', () => {
      expect(() =>
        validateWidgetGridPosition(
          { ...validGridPosition, row: -1 },
          'My Custom Widget',
        ),
      ).toThrow(/My Custom Widget/);
    });
  });

  describe('Invalid column positions', () => {
    it('should throw for negative column', () => {
      expect(() =>
        validateWidgetGridPosition(
          { ...validGridPosition, column: -1 },
          'Test Widget',
        ),
      ).toThrow(PageLayoutWidgetException);
    });

    it('should throw for column exceeding max columns', () => {
      expect(() =>
        validateWidgetGridPosition(
          { ...validGridPosition, column: WIDGET_GRID_MAX_COLUMNS },
          'Test Widget',
        ),
      ).toThrow(PageLayoutWidgetException);
    });

    it('should throw for column at grid boundary', () => {
      expect(() =>
        validateWidgetGridPosition(
          {
            row: 0,
            column: WIDGET_GRID_MAX_COLUMNS,
            rowSpan: 1,
            columnSpan: 1,
          },
          'Test Widget',
        ),
      ).toThrow(/exceeds grid width/);
    });
  });

  describe('Invalid span values', () => {
    it('should throw for zero rowSpan', () => {
      expect(() =>
        validateWidgetGridPosition(
          { ...validGridPosition, rowSpan: 0 },
          'Test Widget',
        ),
      ).toThrow(PageLayoutWidgetException);
    });

    it('should throw for negative rowSpan', () => {
      expect(() =>
        validateWidgetGridPosition(
          { ...validGridPosition, rowSpan: -1 },
          'Test Widget',
        ),
      ).toThrow(PageLayoutWidgetException);
    });

    it('should throw for zero columnSpan', () => {
      expect(() =>
        validateWidgetGridPosition(
          { ...validGridPosition, columnSpan: 0 },
          'Test Widget',
        ),
      ).toThrow(PageLayoutWidgetException);
    });

    it('should throw for negative columnSpan', () => {
      expect(() =>
        validateWidgetGridPosition(
          { ...validGridPosition, columnSpan: -1 },
          'Test Widget',
        ),
      ).toThrow(PageLayoutWidgetException);
    });
  });

  describe('Widget extending beyond grid', () => {
    it('should throw when widget extends beyond grid width', () => {
      expect(() =>
        validateWidgetGridPosition(
          {
            row: 0,
            column: 10,
            rowSpan: 1,
            columnSpan: 3,
          },
          'Test Widget',
        ),
      ).toThrow(/extends beyond grid/);
    });

    it('should throw when widget at column 11 has columnSpan 2', () => {
      expect(() =>
        validateWidgetGridPosition(
          {
            row: 0,
            column: 11,
            rowSpan: 1,
            columnSpan: 2,
          },
          'Test Widget',
        ),
      ).toThrow(PageLayoutWidgetException);
    });

    it('should throw when full-width widget starts at column 1', () => {
      expect(() =>
        validateWidgetGridPosition(
          {
            row: 0,
            column: 1,
            rowSpan: 1,
            columnSpan: 12,
          },
          'Test Widget',
        ),
      ).toThrow(/extends beyond grid/);
    });
  });

  describe('Error messages', () => {
    it('should include row and column values in error for negative positions', () => {
      expect(() =>
        validateWidgetGridPosition(
          { row: -5, column: -3, rowSpan: 1, columnSpan: 1 },
          'Test Widget',
        ),
      ).toThrow(/row=-5.*column=-3/);
    });

    it('should include span values in error for invalid spans', () => {
      expect(() =>
        validateWidgetGridPosition(
          { row: 0, column: 0, rowSpan: -2, columnSpan: 0 },
          'Test Widget',
        ),
      ).toThrow(/rowSpan=-2.*columnSpan=0/);
    });

    it('should include max columns value in error', () => {
      expect(() =>
        validateWidgetGridPosition(
          {
            row: 0,
            column: 10,
            rowSpan: 1,
            columnSpan: 5,
          },
          'Test Widget',
        ),
      ).toThrow(new RegExp(WIDGET_GRID_MAX_COLUMNS.toString()));
    });

    it('should include max rows value in error', () => {
      expect(() =>
        validateWidgetGridPosition(
          {
            row: WIDGET_GRID_MAX_ROWS + 10,
            column: 0,
            rowSpan: 1,
            columnSpan: 1,
          },
          'Test Widget',
        ),
      ).toThrow(new RegExp(WIDGET_GRID_MAX_ROWS.toString()));
    });
  });
});
