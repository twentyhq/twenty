import { defineFrontComponent } from 'twenty-sdk/define';

import {
  HOW_TO_REVIEW_FRONT_COMPONENT_ID,
  WELCOME_EMAIL_WORKFLOW_URL,
} from 'src/modules/partner/application-intake/constants/how-to-review.constants';
import { MARKETPLACE_RANKING } from 'src/modules/partner/application-intake/constants/marketplace-ranking.constant';
import { PLAYBOOK_STYLES as styles } from 'src/modules/shared/front-components/playbook-styles';
import {
  CASE_STUDY_BEATS_QUICK_FIELDS,
  RANK_ROWS,
} from 'src/modules/partner/application-intake/front-components/how-to-review/rank-rows';

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

      <section style={styles.trust}>
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

      <section style={styles.lastStep}>
        <div style={styles.num}>04</div>
        <div>
          <h2 style={styles.heading}>They must fill the profile</h2>
          <p style={styles.body}>
            The welcome mail asks them into the workspace. Marketplace rank uses
            a filled profile. A thin profile sits at the bottom — or stays
            hidden.
          </p>
          <p style={styles.bodySpaced}>
            Tell them to complete <strong>My Profile</strong> and{' '}
            <strong>My Case Studies</strong>. Bonuses from the ranking code:
          </p>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>What they add</th>
                <th style={styles.thRight}>Bonus</th>
              </tr>
            </thead>
            <tbody>
              {RANK_ROWS.map((row) => (
                <tr key={row.label}>
                  <td style={styles.td}>{row.label}</td>
                  <td style={styles.tdPoints}>{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={styles.note}>
            Introduction under {MARKETPLACE_RANKING.ghostIntroductionMaxLength}{' '}
            characters and no picture → ghost. The directory hides them.
            {CASE_STUDY_BEATS_QUICK_FIELDS
              ? ' One case study beats picture + calendar + rate together.'
              : ''}
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
