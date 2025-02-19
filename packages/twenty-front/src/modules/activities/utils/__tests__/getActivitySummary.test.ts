import { getActivitySummary } from '../getActivitySummary';

describe('getActivitySummary', () => {
  it('should work for empty body ""', () => {
    const activityBody = {};

    const res = getActivitySummary(JSON.stringify(activityBody));

    expect(res).toEqual('');
  });
  it('should work for empty body {}', () => {
    const activityBody = '';

    const res = getActivitySummary(JSON.stringify(activityBody));

    expect(res).toEqual('');
  });
  it('should work for paragraph as first block', () => {
    const activityBody = [
      {
        id: '103003f3-60de-4713-8779-a694ee7a22c9',
        type: 'paragraph',
        props: {
          textColor: 'default',
          backgroundColor: 'default',
          textAlignment: 'left',
        },
        content: [{ type: 'text', text: 'test 1', styles: {} }],
        children: [],
      },
      {
        id: 'bec5b84b-e9e7-49f6-854a-c2a9811f16e5',
        type: 'paragraph',
        props: {
          textColor: 'default',
          backgroundColor: 'default',
          textAlignment: 'left',
        },
        content: [{ type: 'text', text: 'test text', styles: {} }],
        children: [],
      },
      {
        id: 'a347c1e7-65cb-4829-af9e-52fba407c3c8',
        type: 'paragraph',
        props: {
          textColor: 'default',
          backgroundColor: 'default',
          textAlignment: 'left',
        },
        content: [{ type: 'text', text: 'test 2', styles: {} }],
        children: [],
      },
      {
        id: '7b999cbb-f248-4ead-a64f-94840191dc86',
        type: 'paragraph',
        props: {
          textColor: 'default',
          backgroundColor: 'default',
          textAlignment: 'left',
        },
        content: [],
        children: [],
      },
    ];

    const res = getActivitySummary(JSON.stringify(activityBody));

    expect(res).toEqual('test 1');
  });
  it('should work for image as first block', () => {
    const activityBody = [
      {
        id: '7c7779f3-9c60-4504-ab3b-230fe390d430',
        type: 'image',
        props: {
          backgroundColor: 'default',
          textAlignment: 'left',
          url: 'https://twenty-icons.com/qonto.com',
          caption: '',
          width: 230,
        },
        children: [],
      },
      {
        id: 'ab470e73-4564-493d-a1ad-bbe2c86c4481',
        type: 'paragraph',
        props: {
          textColor: 'default',
          backgroundColor: 'default',
          textAlignment: 'left',
        },
        content: [{ type: 'text', text: 'TEST', styles: {} }],
        children: [],
      },
      {
        id: 'd4720499-2a45-4f3b-96cf-a8415c295678',
        type: 'paragraph',
        props: {
          textColor: 'default',
          backgroundColor: 'default',
          textAlignment: 'left',
        },
        content: [],
        children: [],
      },
    ];

    const res = getActivitySummary(JSON.stringify(activityBody));

    expect(res).toEqual('');
  });

  it('should work for table as first block', () => {
    const activityBody = [
      {
        id: '591c3aa1-9e51-465d-bb59-611ef60344fb',
        type: 'table',
        props: { textColor: 'default', backgroundColor: 'default' },
        content: {
          type: 'tableContent',
          rows: [{ cells: [[], [], []] }, { cells: [[], [], []] }],
        },
        children: [],
      },
      {
        id: '1899ab29-0122-4890-bb50-4d7cf2802f98',
        type: 'paragraph',
        props: {
          textColor: 'default',
          backgroundColor: 'default',
          textAlignment: 'left',
        },
        content: [],
        children: [],
      },
    ];

    const res = getActivitySummary(JSON.stringify(activityBody));

    expect(res).toEqual('');
  });
});
