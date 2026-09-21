import { type TopicOptOutState } from 'src/engine/core-modules/emailing-domain/types/topic-opt-out-state.type';
import { buildUnsubscribePreferencesPage } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-preferences-page.util';

const buildPage = (topics: TopicOptOutState[]) =>
  buildUnsubscribePreferencesPage({
    token: 'token-1',
    topics,
    updatePath: '/unsubscribe/update',
    unsubscribeAllPath: '/unsubscribe/all',
  });

describe('buildUnsubscribePreferencesPage', () => {
  describe('when there are no topics', () => {
    it('renders a single unsubscribe call to action', () => {
      const page = buildPage([]);

      expect(page).toContain('>Unsubscribe</button>');
      expect(page).toContain('action="/unsubscribe/all"');
      expect(page.match(/<button/g)).toHaveLength(1);
    });

    it('does not render the preferences form', () => {
      const page = buildPage([]);

      expect(page).not.toContain('action="/unsubscribe/update"');
      expect(page).not.toContain('type="checkbox"');
      expect(page).not.toContain('Confirm your preferences:');
      expect(page).not.toContain('class="divider"');
    });
  });

  describe('when there are topics', () => {
    const topics: TopicOptOutState[] = [
      {
        unsubscribeTopicId: 'topic-1',
        topicName: 'Product updates',
        optedOut: false,
      },
      {
        unsubscribeTopicId: 'topic-2',
        topicName: 'Newsletter',
        optedOut: true,
      },
    ];

    it('renders both the update and unsubscribe all calls to action', () => {
      const page = buildPage(topics);

      expect(page).toContain('action="/unsubscribe/update"');
      expect(page).toContain('>Update</button>');
      expect(page).toContain('action="/unsubscribe/all"');
      expect(page).toContain('>Unsubscribe all</button>');
    });

    it('checks only the topics the recipient is still opted into', () => {
      const page = buildPage(topics);

      expect(page).toContain('value="topic-1" checked />Product updates');
      expect(page).toContain('value="topic-2" />Newsletter');
    });

    it('falls back to a placeholder for unnamed topics', () => {
      const page = buildPage([
        { unsubscribeTopicId: 'topic-3', topicName: null, optedOut: false },
      ]);

      expect(page).toContain('Untitled topic');
    });
  });

  it('escapes the token in every form', () => {
    const page = buildUnsubscribePreferencesPage({
      token: '"><script>alert(1)</script>',
      topics: [
        { unsubscribeTopicId: 'topic-1', topicName: 'News', optedOut: false },
      ],
      updatePath: '/unsubscribe/update',
      unsubscribeAllPath: '/unsubscribe/all',
    });

    expect(page).not.toContain('<script>');
  });
});
