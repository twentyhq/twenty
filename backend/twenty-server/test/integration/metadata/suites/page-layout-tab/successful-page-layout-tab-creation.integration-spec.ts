import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

type TestContext = {
  input: {
    title: string;
    position?: number;
  };
};

const SUCCESSFUL_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'create a page layout tab',
    context: {
      input: {
        title: 'Test Tab',
      },
    },
  },
  {
    title: 'create a page layout tab with position',
    context: {
      input: {
        title: 'Positioned Tab',
        position: 5,
      },
    },
  },
];

describe('Page layout tab creation should succeed', () => {
  let testPageLayoutId: string;
  let createdPageLayoutTabId: string;

  beforeAll(async () => {
    const { data } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Test Page Layout For Tabs' },
    });

    testPageLayoutId = data.createPageLayout.id;
  });

  afterAll(async () => {
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: testPageLayoutId },
    });
  });

  afterEach(async () => {
    if (createdPageLayoutTabId) {
      await destroyOnePageLayoutTab({
        expectToFail: false,
        input: { id: createdPageLayoutTabId },
      });
      createdPageLayoutTabId = '';
    }
  });

  it.each(eachTestingContextFilter(SUCCESSFUL_TEST_CASES))(
    'should $title',
    async ({ context: { input } }) => {
      const { data } = await createOnePageLayoutTab({
        expectToFail: false,
        input: {
          ...input,
          pageLayoutId: testPageLayoutId,
        },
      });

      createdPageLayoutTabId = data?.createPageLayoutTab?.id;

      expect(data.createPageLayoutTab).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({ ...data.createPageLayoutTab }),
      );
    },
  );
});
