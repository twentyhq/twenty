import { buildReleasedStockByApplication } from 'src/engine/core-modules/file-storage/utils/build-released-stock-by-application.util';

const APPLICATION_ID = 'b30a4560-fedb-4ccd-904a-3788762c7d33';
const ANOTHER_APPLICATION_ID = 'c41b5671-0fec-4dde-a15b-4899873d8e44';

describe('buildReleasedStockByApplication', () => {
  it('sums the bytes and counts the rows of each application', () => {
    expect(
      buildReleasedStockByApplication([
        { size: 1000, applicationId: APPLICATION_ID },
        { size: 2000, applicationId: APPLICATION_ID },
        { size: 40, applicationId: ANOTHER_APPLICATION_ID },
      ]),
    ).toEqual(
      new Map([
        [APPLICATION_ID, { bytes: 3000, quantity: 2 }],
        [ANOTHER_APPLICATION_ID, { bytes: 40, quantity: 1 }],
      ]),
    );
  });

  it('gives back nothing when the delete removed no row', () => {
    expect(buildReleasedStockByApplication([])).toEqual(new Map());
  });
});
