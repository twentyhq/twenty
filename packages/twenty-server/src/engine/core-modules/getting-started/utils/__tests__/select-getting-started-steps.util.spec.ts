import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import { GettingStartedTrack } from 'src/engine/core-modules/getting-started/enums/getting-started-track.enum';
import { type GettingStartedSelectionContext } from 'src/engine/core-modules/getting-started/types/getting-started-selection-context.type';
import { selectGettingStartedSteps } from 'src/engine/core-modules/getting-started/utils/select-getting-started-steps.util';

const UNKNOWN_CONTEXT: GettingStartedSelectionContext = {
  isWorkEmail: null,
  hasConnectedMailbox: null,
  hasInstalledFeaturedApp: null,
  companyEnrichment: null,
  personEnrichment: null,
};

const WORK_CONTEXT: GettingStartedSelectionContext = {
  ...UNKNOWN_CONTEXT,
  isWorkEmail: true,
  hasConnectedMailbox: false,
  hasInstalledFeaturedApp: false,
};

describe('selectGettingStartedSteps', () => {
  it('should give the default track when every input is unknown', () => {
    expect(selectGettingStartedSteps(UNKNOWN_CONTEXT)).toEqual({
      track: GettingStartedTrack.DEFAULT,
      steps: [
        GettingStartedStep.CONNECT_MAILBOX,
        GettingStartedStep.IMPORT_DATA,
        GettingStartedStep.INSTALL_APP,
        GettingStartedStep.INVITE_TEAM,
        GettingStartedStep.HANDOVER_DEALS,
        GettingStartedStep.FOLLOW_UP_DEALS,
      ],
    });
  });

  it('should give the default track to a work email', () => {
    expect(selectGettingStartedSteps(WORK_CONTEXT).track).toBe(
      GettingStartedTrack.DEFAULT,
    );
  });

  it('should give the personal track to a personal email', () => {
    expect(
      selectGettingStartedSteps({ ...WORK_CONTEXT, isWorkEmail: false }),
    ).toEqual({
      track: GettingStartedTrack.PERSONAL,
      steps: [
        GettingStartedStep.CONNECT_MAILBOX,
        GettingStartedStep.IMPORT_DATA,
        GettingStartedStep.INSTALL_APP,
        GettingStartedStep.FOLLOW_UP_DEALS,
      ],
    });
  });

  it('should drop the mailbox step when a mailbox is already connected', () => {
    expect(
      selectGettingStartedSteps({ ...WORK_CONTEXT, hasConnectedMailbox: true })
        .steps,
    ).not.toContain(GettingStartedStep.CONNECT_MAILBOX);
  });

  it('should drop the app step when a featured app is already installed', () => {
    expect(
      selectGettingStartedSteps({
        ...WORK_CONTEXT,
        hasInstalledFeaturedApp: true,
      }).steps,
    ).not.toContain(GettingStartedStep.INSTALL_APP);
  });

  it('should not change the steps from enrichment yet', () => {
    expect(
      selectGettingStartedSteps({
        ...WORK_CONTEXT,
        companyEnrichment: { employeeCount: 250, industry: 'software' },
        personEnrichment: {
          email: 'ada@acme.com',
          jobTitle: 'Head of Sales',
          jobTitleLevels: ['director'],
        },
      }),
    ).toEqual(selectGettingStartedSteps(WORK_CONTEXT));
  });
});
