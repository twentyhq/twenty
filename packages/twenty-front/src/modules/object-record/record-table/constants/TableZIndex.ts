export const TABLE_Z_INDEX = {
  base: 1,
  cell: {
    withoutGroups: {
      default: 3,
      sticky: 12,
      editMode: 30,
    },
    withGroups: {
      default: 3,
      sticky: 12,
      editMode: 30,
    },
  },
  headerColumns: {
    withoutGroups: {
      headerColumnsSticky: 14,
      headerColumnsNormal: 10,
    },
    withGroups: {
      headerColumnsSticky: 21,
      headerColumnsNormal: 20,
    },
  },
  withoutGroupsCell0_0: {
    cell0_0HoveredWithoutScroll: 15,
    cell0_0Normal: 12,
  },
  groupSection: {
    stickyCell: 10,
    normalCell: 8,
  },
  withGroups: {
    noScrollAtAll: {
      hoverPortalCellOnFirstScrollableColumn: 16,
      hoverPortalCellOnNormalColumn: 14,
      hoverPortalCellOnLabelIdentifierColumn: 14,
      firstScrollableHeaderCell: 19,
    },
    scrolledBothVerticallyAndHorizontally: {
      hoverPortalCellOnNormalColumn: 9,
      hoverPortalCellOnFirstScrollableColumn: 9,
      hoverPortalCellOnLabelIdentifierColumn: 9,
      firstScrollableHeaderCell: 19,
    },
    scrolledHorizontallyOnly: {
      hoverPortalCellOnLabelIdentifierColumn: 9,
      hoverPortalCellOnNormalColumn: 9,
      hoverPortalCellOnFirstScrollableColumn: 9,
      firstScrollableHeaderCell: 19,
    },
    scrolledVerticallyOnly: {
      hoverPortalCellOnNormalColumn: 9,
      hoverPortalCellOnFirstScrollableColumn: 16,
      hoverPortalCellOnLabelIdentifierColumn: 9,
      firstScrollableHeaderCell: 19,
    },
  },
  withoutGroups: {
    noScrollAtAll: {
      hoverPortalCellOnFirstScrollableColumn: 17,
      hoverPortalCellOnNormalColumn: 17,
      hoverPortalCellOnLabelIdentifierColumn: 17,
      firstScrollableHeaderCell: 12,
    },
    scrolledBothVerticallyAndHorizontally: {
      hoverPortalCellOnNormalColumn: 2,
      hoverPortalCellOnFirstScrollableColumn: 2,
      hoverPortalCellOnLabelIdentifierColumn: 2,
      firstScrollableHeaderCell: 12,
    },
    scrolledHorizontallyOnly: {
      hoverPortalCellOnLabelIdentifierColumn: 17,
      hoverPortalCellOnNormalColumn: 11,
      hoverPortalCellOnFirstScrollableColumn: 11,
      firstScrollableHeaderCell: 10,
    },
    scrolledVerticallyOnly: {
      hoverPortalCellOnNormalColumn: 9,
      hoverPortalCellOnFirstScrollableColumn: 13,
      hoverPortalCellOnLabelIdentifierColumn: 13,
      firstScrollableHeaderCell: 14,
    },
  },
  columnGrip: 30,
  footer: {
    tableWithGroups: {
      default: 17,
      stickyColumn: 18,
    },
    tableWithoutGroups: {
      default: 18,
      stickyColumn: 20,
    },
  },
  activeRows: {
    firstRow: {
      sticky: {
        scrolledVertically: 10,
        noVerticalScroll: 15,
      },
      normal: {
        scrolledVertically: 8,
        noVerticalScroll: 11,
      },
    },
    afterFirstRow: {
      sticky: {
        scrolledVertically: 8,
        noVerticalScroll: 8,
      },
      normal: {
        scrolledVertically: 7,
        noVerticalScroll: 7,
      },
    },
  },
};
