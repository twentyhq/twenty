import { type TopicOptOutState } from 'src/engine/core-modules/emailing-domain/types/topic-opt-out-state.type';
import { type UnsubscribePageSender } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-page-sender.type';
import { type UnsubscribePageTracking } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-page-tracking.type';
import { buildUnsubscribePreferencesPage } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-preferences-page.util';

const SENDER: UnsubscribePageSender = {
  name: 'Acme',
  logoUrl: 'https://files.example.com/acme-logo.png',
};

const buildPage = ({
  topics = [],
  tracking,
  sender = SENDER,
  token = 'token-1',
}: {
  topics?: TopicOptOutState[];
  tracking?: UnsubscribePageTracking;
  sender?: UnsubscribePageSender;
  token?: string;
}) =>
  buildUnsubscribePreferencesPage({
    token,
    sender,
    emailAddress: 'jane@example.com',
    topics,
    tracking,
    updatePath: '/unsubscribe/update',
    unsubscribeAllPath: '/unsubscribe/all',
  });

const TOPICS: TopicOptOutState[] = [
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

describe('buildUnsubscribePreferencesPage', () => {
  describe('sender', () => {
    it('names the sender and shows its logo', () => {
      const page = buildPage({ topics: TOPICS });

      expect(page).toContain('<span>Acme</span>');
      expect(page).toContain(
        '<img class="logo" src="https://files.example.com/acme-logo.png" alt="" />',
      );
    });

    it('leaves the header out when the sender is unknown', () => {
      const page = buildPage({
        topics: TOPICS,
        sender: { name: null, logoUrl: null },
      });

      expect(page).not.toContain('class="sender"');
    });

    it('escapes the sender name', () => {
      const page = buildPage({
        topics: TOPICS,
        sender: { name: '<script>alert(1)</script>', logoUrl: null },
      });

      expect(page).not.toContain('<script>');
    });
  });

  describe('when there is nothing to choose from', () => {
    it('renders a single unsubscribe call to action for the address', () => {
      const page = buildPage({});

      expect(page).toContain(
        'You will stop receiving these emails at jane@example.com.',
      );
      expect(page).toContain('>Unsubscribe</button>');
      expect(page).toContain('action="/unsubscribe/all"');
      expect(page.match(/<button/g)).toHaveLength(1);
    });

    it('does not render the preferences form', () => {
      const page = buildPage({});

      expect(page).not.toContain('action="/unsubscribe/update"');
      expect(page).not.toContain('type="checkbox"');
      expect(page).not.toContain('Uncheck the emails');
      expect(page).not.toContain('class="divider"');
    });
  });

  describe('when there are topics', () => {
    it('asks the address to uncheck the emails it no longer wants', () => {
      const page = buildPage({ topics: TOPICS });

      expect(page).toContain(
        'Uncheck the emails you no longer want at jane@example.com.',
      );
    });

    it('renders both the update and unsubscribe all calls to action', () => {
      const page = buildPage({ topics: TOPICS });

      expect(page).toContain('action="/unsubscribe/update"');
      expect(page).toContain('>Update</button>');
      expect(page).toContain('action="/unsubscribe/all"');
      expect(page).toContain('>Unsubscribe all</button>');
    });

    it('checks only the topics the recipient is still opted into', () => {
      const page = buildPage({ topics: TOPICS });

      expect(page).toContain('value="topic-1" checked />Product updates');
      expect(page).toContain('value="topic-2" />Newsletter');
    });

    it('falls back to a placeholder for unnamed topics', () => {
      const page = buildPage({
        topics: [
          { unsubscribeTopicId: 'topic-3', topicName: null, optedOut: false },
        ],
      });

      expect(page).toContain('Untitled topic');
    });
  });

  it('escapes the token in every form', () => {
    const page = buildPage({
      topics: [
        { unsubscribeTopicId: 'topic-1', topicName: 'News', optedOut: false },
      ],
      token: '"><script>alert(1)</script>',
    });

    expect(page).not.toContain('<script>');
  });

  describe('when the workspace tracks engagement', () => {
    it('offers the tracking choice even without topics', () => {
      const page = buildPage({
        tracking: {
          isOptedOut: false,
          isOpenTrackingEnabled: false,
          isClickTrackingEnabled: true,
        },
      });

      expect(page).toContain('Email preferences for jane@example.com');
      expect(page).toContain('action="/unsubscribe/update"');
      expect(page).toContain('value="TRACKED" checked />');
      expect(page).toContain('value="OPTED_OUT" />');
    });

    it('preselects the refusal the recipient already made', () => {
      const page = buildPage({
        tracking: {
          isOptedOut: true,
          isOpenTrackingEnabled: false,
          isClickTrackingEnabled: true,
        },
      });

      expect(page).toContain('value="TRACKED" />');
      expect(page).toContain('value="OPTED_OUT" checked />');
    });

    it.each([
      {
        isOpenTrackingEnabled: true,
        isClickTrackingEnabled: true,
        description:
          'Acme may record when you open its emails and which links you click.',
        keepLabel: 'Keep tracking my opens and clicks',
      },
      {
        isOpenTrackingEnabled: true,
        isClickTrackingEnabled: false,
        description: 'Acme may record when you open its emails.',
        keepLabel: 'Keep tracking my opens',
      },
      {
        isOpenTrackingEnabled: false,
        isClickTrackingEnabled: true,
        description: 'Acme may record which links you click in its emails.',
        keepLabel: 'Keep tracking my clicks',
      },
    ])(
      'describes only what is tracked (opens: $isOpenTrackingEnabled, clicks: $isClickTrackingEnabled)',
      ({
        isOpenTrackingEnabled,
        isClickTrackingEnabled,
        description,
        keepLabel,
      }) => {
        const page = buildPage({
          tracking: {
            isOptedOut: false,
            isOpenTrackingEnabled,
            isClickTrackingEnabled,
          },
        });

        expect(page).toContain(description);
        expect(page).toContain(`${keepLabel}</label>`);
        expect(page).toContain('Opt out of tracking</label>');
      },
    );

    it('falls back to a generic sender when the workspace has no name', () => {
      const page = buildPage({
        sender: { name: null, logoUrl: null },
        tracking: {
          isOptedOut: false,
          isOpenTrackingEnabled: false,
          isClickTrackingEnabled: true,
        },
      });

      expect(page).toContain('This sender may record');
    });
  });
});
