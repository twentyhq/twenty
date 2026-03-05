export const TABLE_Z_INDEX = {
  base: 1,
  hoverPortal: 4,
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
  groupSection: {
    stickyCell: 10,
    normalCell: 8,
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
