import { defineFrontComponent } from 'twenty-sdk/define';

import {
  HOW_TO_REVIEW_FRONT_COMPONENT_ID,
  WELCOME_EMAIL_WORKFLOW_URL,
} from 'src/modules/partner/application-intake/constants/how-to-review.constants';
import { MARKETPLACE_RANKING } from 'src/modules/partner/application-intake/constants/marketplace-ranking.constant';

const COLORS = {
  bg: '#ffffff',
  fg: '#1c1c1c',
  muted: '#1c1c1c99',
  subtle: '#1c1c1c66',
  border: '#1c1c1c1a',
  accent: '#4a38f5',
  accentSoft: 'rgba(74, 56, 245, 0.08)',
  mutedBg: '#f4f4f4',
} as const;

const FONT =
  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
const MONO = '"Azeret Mono", ui-monospace, monospace';

const styles = {
  root: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    minHeight: 'calc(100dvh - 56px)',
    boxSizing: 'border-box' as const,
    padding: 32,
    fontFamily: FONT,
    color: COLORS.fg,
    background: COLORS.bg,
  },
  article: {
    width: '100%',
    maxWidth: 720,
  },
  kicker: {
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
    color: COLORS.accent,
    margin: '0 0 8px',
  },
  title: {
    fontSize: 28,
    fontWeight: 500,
    letterSpacing: -0.4,
    margin: '0 0 8px',
  },
  lede: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: '22px',
    margin: '0 0 28px',
  },
  step: {
    display: 'grid',
    gridTemplateColumns: '36px 1fr',
    gap: 16,
    padding: '20px 0',
    borderTop: `1px solid ${COLORS.border}`,
  },
  trust: {
    background: COLORS.accentSoft,
    margin: '0 -16px',
    padding: '20px 16px',
  },
  num: {
    fontFamily: MONO,
    fontSize: 13,
    color: COLORS.accent,
    paddingTop: 2,
  },
  heading: {
    fontSize: 16,
    fontWeight: 500,
    margin: '0 0 6px',
  },
  body: {
    margin: 0,
    color: COLORS.fg,
    fontSize: 14,
    lineHeight: '22px',
  },
  list: {
    margin: '8px 0 0',
    paddingLeft: 18,
    color: COLORS.fg,
    fontSize: 14,
    lineHeight: '22px',
  },
  note: {
    marginTop: 8,
    color: COLORS.subtle,
    fontSize: 13,
    lineHeight: '20px',
  },
  pillRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 8,
    margin: '8px 0',
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase' as const,
    padding: '4px 8px',
    borderRadius: 2,
    background: COLORS.mutedBg,
    color: COLORS.muted,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginTop: 12,
    fontSize: 13,
  },
  th: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    textAlign: 'left' as const,
    color: COLORS.subtle,
    fontWeight: 500,
    padding: '6px 0',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  td: {
    padding: '8px 0',
    borderBottom: `1px solid ${COLORS.border}`,
    verticalAlign: 'top' as const,
    lineHeight: '18px',
  },
  tdPoints: {
    fontFamily: MONO,
    fontSize: 12,
    whiteSpace: 'nowrap' as const,
    textAlign: 'right' as const,
    color: COLORS.accent,
    paddingLeft: 16,
  },
  link: {
    color: COLORS.accent,
    textDecoration: 'underline' as const,
  },
};

const RANK_ROWS: { label: string; points: string }[] = [
  {
    label: 'Approved case study',
    points: `+${MARKETPLACE_RANKING.pointsPerCaseStudy} each, max ${MARKETPLACE_RANKING.maxCountedCaseStudies}`,
  },
  {
    label: 'Cover image on that case study',
    points: `+${MARKETPLACE_RANKING.pointsPerCaseStudyCover} each, max ${MARKETPLACE_RANKING.maxCountedCaseStudies}`,
  },
  {
    label: `Introduction, ${MARKETPLACE_RANKING.introductionMinLength}+ characters`,
    points: `+${MARKETPLACE_RANKING.pointsForIntroduction}`,
  },
  {
    label: 'At least one service',
    points: `+${MARKETPLACE_RANKING.pointsForService}`,
  },
  {
    label: 'Profile picture',
    points: `+${MARKETPLACE_RANKING.pointsForProfilePicture}`,
  },
  {
    label: 'Calendar link',
    points: `+${MARKETPLACE_RANKING.pointsForCalendarLink}`,
  },
  {
    label: 'Hourly rate or min. budget',
    points: `+${MARKETPLACE_RANKING.pointsForRateOrBudget}`,
  },
  {
    label: 'At least one category',
    points: `+${MARKETPLACE_RANKING.pointsForCategory}`,
  },
];

const HowToReview = () => (
  <div style={styles.root}>
    <article style={styles.article}>
      <p style={styles.kicker}>Playbook</p>
      <h1 style={styles.title}>Review a partner application</h1>
      <p style={styles.lede}>
        We list partners we can trust. Trust comes from proof they built a real
        thing on Twenty.
      </p>

      <section style={styles.step}>
        <div style={styles.num}>01</div>
        <div>
          <h2 style={styles.heading}>What to review</h2>
          <p style={styles.body}>
            Open <strong>Partner Applications</strong>. Newest first. Read the
            form on the record. Nothing else.
          </p>
          <ul style={styles.list}>
            <li>
              <strong>Who</strong> — name, country, team type, languages
            </li>
            <li>
              <strong>Cover</strong> — categories, skills
            </li>
            <li>
              <strong>Money</strong> — hourly rate, minimum budget
            </li>
          </ul>
        </div>
      </section>

      <section style={{ ...styles.step, ...styles.trust }}>
        <div style={styles.num}>02</div>
        <div>
          <h2 style={styles.heading}>Proof of work — this is the review</h2>
          <p style={styles.body}>
            We need partners who have built a real thing on Twenty. That is how
            we trust them.
          </p>
          <ul style={styles.list}>
            <li>
              <strong>Experience areas</strong> — apps, data models, workflows,
              front components
            </li>
            <li>
              <strong>Notes</strong> — a real project: who it was for, what they
              built
            </li>
            <li>
              <strong>Proof URL</strong> — instance, repo, or video that shows
              that work
            </li>
          </ul>
          <p style={styles.note}>
            Open the proof yourself. The app does not fetch it. No Twenty work,
            thin notes, or a dead proof link → do not list.
          </p>
        </div>
      </section>

      <section style={styles.step}>
        <div style={styles.num}>03</div>
        <div>
          <h2 style={styles.heading}>Set Validation Stage</h2>
          <div style={styles.pillRow}>
            <span style={styles.pill}>VALIDATED — list them</span>
            <span style={styles.pill}>POTENTIAL — keep, do not list</span>
            <span style={styles.pill}>REJECTED — no</span>
          </div>
          <p style={styles.body}>
            A change to <strong>VALIDATED</strong> sends the{' '}
            <a href={WELCOME_EMAIL_WORKFLOW_URL} style={styles.link}>
              welcome email
            </a>{' '}
            on its own. Do not send a second mail.
          </p>
          <p style={styles.note}>
            The row leaves the queue when the stage is not APPLICATION.
          </p>
        </div>
      </section>

      <section style={{ ...styles.step, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={styles.num}>04</div>
        <div>
          <h2 style={styles.heading}>They must fill the profile</h2>
          <p style={styles.body}>
            The welcome mail asks them into the workspace. Marketplace rank uses
            a filled profile. A thin profile sits at the bottom — or stays
            hidden.
          </p>
          <p style={{ ...styles.body, marginTop: 8 }}>
            Tell them to complete <strong>My Profile</strong> and{' '}
            <strong>My Case Studies</strong>. Bonuses from the ranking code:
          </p>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>What they add</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Bonus</th>
              </tr>
            </thead>
            <tbody>
              {RANK_ROWS.map((row) => (
                <tr key={row.label}>
                  <td style={styles.td}>{row.label}</td>
                  <td style={{ ...styles.td, ...styles.tdPoints }}>{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={styles.note}>
            Introduction under {MARKETPLACE_RANKING.ghostIntroductionMaxLength}{' '}
            characters and no picture → ghost. The directory hides them. One
            case study beats picture + calendar + rate together.
          </p>
        </div>
      </section>
    </article>
  </div>
);

export default defineFrontComponent({
  universalIdentifier: HOW_TO_REVIEW_FRONT_COMPONENT_ID,
  name: 'How to review',
  description:
    'Admin playbook for reviewing partner applications in Matching Admin Workspace.',
  component: HowToReview,
});
