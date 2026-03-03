/* eslint-disable no-console */
import { lingui } from '@lingui/vite-plugin';
import { isNonEmptyString } from '@sniptt/guards';
import react from '@vitejs/plugin-react-swc';
import wyw from '@wyw-in-js/vite';
import fs from 'fs';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import {
  defineConfig,
  loadEnv,
  type PluginOption,
  searchForWorkspaceRoot,
} from 'vite';
import checker from 'vite-plugin-checker';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
type Checkers = Parameters<typeof checker>[0];

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, __dirname, '');

  const {
    REACT_APP_SERVER_BASE_URL,
    VITE_BUILD_SOURCEMAP,
    VITE_DISABLE_TYPESCRIPT_CHECKER,
    VITE_HOST,
    SSL_CERT_PATH,
    SSL_KEY_PATH,
    REACT_APP_PORT,
    IS_DEBUG_MODE,
  } = env;

  const port = isNonEmptyString(REACT_APP_PORT)
    ? parseInt(REACT_APP_PORT)
    : 3001;

  const isBuildCommand = command === 'build';

  const tsConfigPath = isBuildCommand
    ? path.resolve(__dirname, './tsconfig.build.json')
    : path.resolve(__dirname, './tsconfig.json');

  const CHUNK_SIZE_WARNING_LIMIT = 1024 * 1024; // 1MB
  // Please don't increase this limit for main index chunk
  // If it gets too big then find modules in the code base
  // that can be loaded lazily, there are more!
  const MAIN_CHUNK_SIZE_LIMIT = 6.8 * 1024 * 1024; // 6.8MB for main index chunk
  const OTHER_CHUNK_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB for other chunks

  const checkers: Checkers = {
    overlay: false,
  };

  if (VITE_DISABLE_TYPESCRIPT_CHECKER === 'true') {
    console.log(
      `VITE_DISABLE_TYPESCRIPT_CHECKER: ${VITE_DISABLE_TYPESCRIPT_CHECKER}`,
    );
  }

  if (VITE_BUILD_SOURCEMAP === 'true') {
    console.log(`VITE_BUILD_SOURCEMAP: ${VITE_BUILD_SOURCEMAP}`);
  }

  if (VITE_DISABLE_TYPESCRIPT_CHECKER !== 'true') {
    checkers['typescript'] = {
      tsconfigPath: tsConfigPath,
    };
  }

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-front',

    server: {
      port: port,
      ...(VITE_HOST ? { host: VITE_HOST } : {}),
      ...(SSL_KEY_PATH && SSL_CERT_PATH
        ? {
            protocol: 'https',
            https: {
              key: fs.readFileSync(env.SSL_KEY_PATH),
              cert: fs.readFileSync(env.SSL_CERT_PATH),
            },
          }
        : {
            protocol: 'http',
          }),
      fs: {
        allow: [
          searchForWorkspaceRoot(process.cwd()),
          '**/@blocknote/core/src/fonts/**',
        ],
      },
    },

    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        plugins: [['@lingui/swc-plugin', {}]],
      }),
      tsconfigPaths({
        root: __dirname,
        projects: ['tsconfig.json'],
      }),
      svgr(),
      lingui({
        configPath: path.resolve(__dirname, './lingui.config.ts'),
      }),
      checker(checkers),
      {
        ...wyw({
          include: [
            '**/twenty-ui/src/**/*.{ts,tsx}',
            '**/AdvancedTextEditor.tsx',
            '**/BubbleMenuIconButton.tsx',
            '**/TextBubbleMenu.tsx',
            '**/TurnIntoBlockDropdown.tsx',
            '**/WorkflowAttachmentChip.tsx',
            '**/WorkflowSendEmailAttachments.tsx',
            '**/ResizableImageView.tsx',
            '**/SettingsBillingSubscriptionInfo.tsx',
            '**/SubscriptionBenefit.tsx',
            '**/SubscriptionInfoContainer.tsx',
            '**/SubscriptionPrice.tsx',
            '**/TrialCard.tsx',
            '**/MeteredPriceSelector.tsx',
            '**/PlansTags.tsx',
            '**/SettingsBillingLabelValueItem.tsx',
            '**/SubscriptionInfoRowContainer.tsx',
            '**/FileBlock.tsx',
            '**/MentionInlineContent.tsx',
            '**/BlockEditor.tsx',
            '**/CustomMentionMenu.tsx',
            '**/CustomSideMenu.tsx',
            '**/CustomSideMenuOptions.tsx',
            '**/CustomSlashMenu.tsx',
            '**/CurrentWorkspaceMemberOrphanFavorites.tsx',
            '**/FavoritesBackButton.tsx',
            '**/FavoritesDroppable.tsx',
            '**/FavoritesSkeletonLoader.tsx',
            '**/FavoriteFolderPickerList.tsx',
            '**/InformationBanner.tsx',
            '**/InformationBannerWrapper.tsx',
            '**/InformationBannerDeletedRecord.tsx',
            '**/AddToNavigationDragHandle.tsx',
            '**/CurrentWorkspaceMemberOrphanNavigationMenuItems.tsx',
            '**/NavigationItemDropTarget.tsx',
            '**/NavigationMenuEditModeBar.tsx',
            '**/NavigationMenuItemBackButton.tsx',
            '**/NavigationMenuItemDroppable.tsx',
            '**/NavigationMenuItemIconContainer.tsx',
            '**/NavigationMenuItemSkeletonLoader.tsx',
            '**/ObjectIconWithViewOverlay.tsx',
            '**/WorkspaceNavigationMenuItems.tsx',
            '**/WorkspaceNavigationMenuItemsFolder.tsx',
            '**/MainNavigationDrawerAIChatContent.tsx',
            '**/MainNavigationDrawerNavigationContent.tsx',
            '**/MainNavigationDrawerScrollableItems.tsx',
            '**/MainNavigationDrawerTabsRow.tsx',
            '**/RecordTableCellBaseContainer.tsx',
            '**/RecordTableCellDisplayContainer.tsx',
            '**/RecordTableCellFirstRowFirstColumn.tsx',
            '**/RecordTableCellLoading.tsx',
            '**/RecordTableCellStyleWrapper.tsx',
            '**/RecordTableDragAndDropPlaceholderCell.tsx',
            '**/RecordTableAggregateFooterCell.tsx',
            '**/RecordTableHeaderAddColumnButton.tsx',
            '**/RecordTableHeaderCell.tsx',
            '**/RecordTableHeaderCheckboxColumn.tsx',
            '**/RecordTableHeaderDragDropColumn.tsx',
            '**/RecordTableHeaderFirstCell.tsx',
            '**/RecordTableHeaderFirstScrollableCell.tsx',
            '**/RecordTableHeaderLastEmptyColumn.tsx',
            '**/RecordTableAddButtonPlaceholderCell.tsx',
            '**/RecordTableGroupSectionLastDynamicFillingCell.tsx',
            '**/RecordTableLastDynamicFillingCell.tsx',
            '**/RecordTableRowVirtualizedContainer.tsx',
            '**/RecordTableVirtualizedBodyPlaceholder.tsx',
            '**/SignInAppNavigationDrawerMock.tsx',
            '**/SignInBackgroundMockContainer.tsx',
            '**/SignInBackgroundMockPage.tsx',
            '**/Heading.tsx',
            '**/MatchColumnSelectFieldSelectDropdownContent.tsx',
            '**/MatchColumnToFieldSelect.tsx',
            '**/SpreadSheetImportModalCloseButton.tsx',
            '**/SpreadSheetImportModalWrapper.tsx',
            '**/SpreadsheetImportTable.tsx',
            '**/StepNavigationButton.tsx',
            '**/ImportDataStep.tsx',
            '**/MatchColumnsStep.tsx',
            '**/ColumnGrid.tsx',
            '**/SubMatchingSelectControlContainer.tsx',
            '**/SubMatchingSelectDropdownButton.tsx',
            '**/SubMatchingSelectRow.tsx',
            '**/SubMatchingSelectRowLeftSelect.tsx',
            '**/SubMatchingSelectRowRightDropdown.tsx',
            '**/TemplateColumn.tsx',
            '**/UnmatchColumn.tsx',
            '**/UnmatchColumnBanner.tsx',
            '**/UserTableColumn.tsx',
            '**/SelectHeaderStep.tsx',
            '**/SelectSheetStep.tsx',
            '**/SpreadsheetImportStepper.tsx',
            '**/SpreadsheetImportStepperContainer.tsx',
            '**/UploadStep.tsx',
            '**/DropZone.tsx',
            '**/ValidationStep.tsx',
            '**/columns.tsx',
            '**/BooleanDisplay.tsx',
            '**/EllipsisDisplay.tsx',
            '**/EmailsDisplay.tsx',
            '**/MultiSelectDisplay.tsx',
            '**/PhonesDisplay.tsx',
            '**/TextDisplay.tsx',
            '**/RatingInput.tsx',
            '**/SortOrFilterChip.tsx',
            '**/UpdateViewButtonGroup.tsx',
            '**/ViewBarDetails.tsx',
            '**/ViewBarFilterDropdownAdvancedFilterButton.tsx',
            '**/ViewBarFilterDropdownAnyFieldSearchButtonMenuItem.tsx',
            '**/ViewBarFilterDropdownBottomMenu.tsx',
            '**/ViewBarFilterDropdownFieldSelectMenu.tsx',
            '**/ViewPickerContentCreateMode.tsx',
            '**/ViewPickerDropdown.tsx',
            '**/ViewPickerIconAndNameContainer.tsx',
            '**/ViewPickerListContent.tsx',
            '**/ViewPickerSaveButtonContainer.tsx',
            '**/ViewPickerSelectContainer.tsx',
            '**/AIChatAssistantMessageRenderer.tsx',
            '**/AIChatBanner.tsx',
            '**/AIChatContextUsageButton.tsx',
            '**/AIChatEmptyState.tsx',
            '**/AIChatErrorMessage.tsx',
            '**/AIChatMessage.stories.tsx',
            '**/AIChatMessage.tsx',
            '**/AIChatSkeletonLoader.tsx',
            '**/AIChatStandaloneError.tsx',
            '**/AIChatSuggestedPrompts.tsx',
            '**/AIChatTab.tsx',
            '**/AIChatThreadGroup.tsx',
            '**/AIChatThreadsList.tsx',
            '**/ActionButton.tsx',
            '**/ActivityList.tsx',
            '**/ActivityRow.tsx',
            '**/ActivityTargetChips.tsx',
            '**/AgentChatContextPreview.tsx',
            '**/AgentChatFileUploadButton.tsx',
            '**/AppFullScreenErrorFallback.tsx',
            '**/AppRootErrorFallback.tsx',
            '**/AttachmentList.tsx',
            '**/AttachmentRow.tsx',
            '**/AuthModal.tsx',
            '**/Authorize.tsx',
            '**/BookCall.tsx',
            '**/BookCallDecision.tsx',
            '**/CalendarDayCardContent.tsx',
            '**/CalendarEventDetails.tsx',
            '**/CalendarEventNotSharedContent.tsx',
            '**/CalendarEventParticipantsResponseStatusField.tsx',
            '**/CalendarEventRow.tsx',
            '**/CalendarEventsCard.tsx',
            '**/ChooseYourPlan.tsx',
            '**/ChooseYourPlanContent.tsx',
            '**/CodeExecutionDisplay.tsx',
            '**/ComponentStorybookLayout.tsx',
            '**/ContextUsageProgressRing.tsx',
            '**/CreateProfile.tsx',
            '**/CreateWorkspace.tsx',
            '**/CustomResolverFetchMoreLoader.tsx',
            '**/DocumentViewer.tsx',
            '**/EmailThreadBottomBar.tsx',
            '**/EmailThreadHeader.tsx',
            '**/EmailThreadMessage.tsx',
            '**/EmailThreadMessageBody.tsx',
            '**/EmailThreadMessageBodyPreview.tsx',
            '**/EmailThreadMessageReceivers.tsx',
            '**/EmailThreadMessageSender.tsx',
            '**/EmailThreadNotShared.tsx',
            '**/EmailThreadPreview.tsx',
            '**/EmailVerificationSent.tsx',
            '**/EmailsCard.tsx',
            '**/EventCard.tsx',
            '**/EventCardCalendarEvent.tsx',
            '**/EventCardMessage.tsx',
            '**/EventCardMessageBodyNotShared.tsx',
            '**/EventCardMessageForbidden.tsx',
            '**/EventCardToggleButton.tsx',
            '**/EventFieldDiff.tsx',
            '**/EventFieldDiffLabel.tsx',
            '**/EventFieldDiffValue.tsx',
            '**/EventList.tsx',
            '**/EventLogDatePickerInput.tsx',
            '**/EventLogFilters.tsx',
            '**/EventLogJsonCell.tsx',
            '**/EventLogResultsTable.tsx',
            '**/EventRow.tsx',
            '**/EventRowActivity.tsx',
            '**/EventRowCalendarEvent.tsx',
            '**/EventRowDynamicComponent.tsx',
            '**/EventRowMainObject.tsx',
            '**/EventRowMainObjectUpdated.tsx',
            '**/EventRowMessage.tsx',
            '**/EventsGroup.tsx',
            '**/FileIcon.tsx',
            '**/FilesCard.tsx',
            '**/FooterNote.tsx',
            '**/FullHeightStorybookLayout.tsx',
            '**/FullScreenDecorator.tsx',
            '**/InviteTeam.tsx',
            '**/LastUsedPill.tsx',
            '**/LazyMarkdownRendererStyledComponents.tsx',
            '**/LeftPanelSkeletonLoader.tsx',
            '**/LocalePicker.tsx',
            '**/Logo.tsx',
            '**/MainNavigationDrawerItemsSkeletonLoader.tsx',
            '**/NavigationDrawerAIChatThreadDateSection.tsx',
            '**/NavigationDrawerAIChatThreadsList.tsx',
            '**/NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader.tsx',
            '**/NavigationDrawerSectionForWorkspaceItems.tsx',
            '**/NotFound.tsx',
            '**/NoteList.tsx',
            '**/NoteTile.tsx',
            '**/NotesCard.tsx',
            '**/OnboardingModalCircularIcon.tsx',
            '**/OnboardingSyncEmailsSettingsCard.tsx',
            '**/PageHeaderActionMenuButtons.tsx',
            '**/ParticipantChip.tsx',
            '**/PasswordReset.tsx',
            '**/PaymentSuccess.tsx',
            '**/PlaceAutocompleteSelect.tsx',
            '**/ProfilingReporter.tsx',
            '**/ReasoningSummaryDisplay.tsx',
            '**/RecordIndexActionMenuDropdown.tsx',
            '**/RightDrawerSkeletonLoader.tsx',
            '**/RightPanelSkeletonLoader.tsx',
            '**/RoutingDebugDisplay.tsx',
            '**/RoutingStatusDisplay.tsx',
            '**/SettingsAI.tsx',
            '**/SettingsAIAgentForm.tsx',
            '**/SettingsAIAgentTableRow.tsx',
            '**/SettingsAIAgentsTable.tsx',
            '**/SettingsAIMCP.tsx',
            '**/SettingsAIModelsTab.tsx',
            '**/SettingsAIPrompts.tsx',
            '**/SettingsAdminConfigVariableDetails.tsx',
            '**/SettingsAdminIndicatorHealthStatus.tsx',
            '**/SettingsAgentDetailSkeletonLoader.tsx',
            '**/SettingsAgentEvalsTab.tsx',
            '**/SettingsAgentForm.tsx',
            '**/SettingsAgentLogsTab.tsx',
            '**/SettingsAgentModelCapabilities.tsx',
            '**/SettingsAgentResponseFormat.tsx',
            '**/SettingsAgentRoleTab.tsx',
            '**/SettingsAgentSettingsTab.tsx',
            '**/SettingsAgentTurnDetail.tsx',
            '**/SettingsApiKeys.tsx',
            '**/SettingsApiWebhooks.tsx',
            '**/SettingsApplicationCustomTab.tsx',
            '**/SettingsApplicationDataTable.tsx',
            '**/SettingsApplicationDataTableRow.tsx',
            '**/SettingsApplicationDetailEnvironmentVariablesTable.tsx',
            '**/SettingsApplicationDetailSkeletonLoader.tsx',
            '**/SettingsApplicationNameDescriptionTable.tsx',
            '**/SettingsApplicationRegistrationDetails.tsx',
            '**/SettingsApplicationTableRow.tsx',
            '**/SettingsApplicationsAvailableTab.tsx',
            '**/SettingsApplicationsDeveloperTab.tsx',
            '**/SettingsApplicationsTable.tsx',
            '**/SettingsAvailableApplicationCard.tsx',
            '**/SettingsAvailableApplicationDetails.tsx',
            '**/SettingsDevelopersApiKeyDetail.tsx',
            '**/SettingsDomains.tsx',
            '**/SettingsEmailingDomains.tsx',
            '**/SettingsEventLogs.tsx',
            '**/SettingsObjectDetailPage.tsx',
            '**/SettingsObjectFieldEdit.tsx',
            '**/SettingsObjectFieldTable.tsx',
            '**/SettingsObjectIndexTable.tsx',
            '**/SettingsObjectTable.tsx',
            '**/SettingsSecurity.tsx',
            '**/SettingsSkillForm.tsx',
            '**/SettingsSkillTableRow.tsx',
            '**/SettingsSkillsTable.tsx',
            '**/SettingsSystemToolTableRow.tsx',
            '**/SettingsToolTableRow.tsx',
            '**/SettingsToolsTable.tsx',
            '**/SettingsTwoFactorAuthenticationMethod.tsx',
            '**/SettingsUpdates.tsx',
            '**/SettingsWebhooks.tsx',
            '**/SettingsWorkspaceMembers.tsx',
            '**/ShimmeringText.tsx',
            '**/SignInUp.tsx',
            '**/SignInUpEmailField.tsx',
            '**/SignInUpGlobalScopeForm.tsx',
            '**/SignInUpPasswordField.tsx',
            '**/SignInUpSSOButtonStyles.ts',
            '**/SignInUpSSOIdentityProviderSelection.tsx',
            '**/SignInUpTwoFactorAuthenticationProvision.tsx',
            '**/SignInUpTwoFactorAuthenticationVerification.tsx',
            '**/SignInUpWithCredentials.tsx',
            '**/SignInUpWorkspaceScopeForm.tsx',
            '**/SkeletonLoader.tsx',
            '**/SubTitle.tsx',
            '**/SyncEmails.tsx',
            '**/TaskGroups.tsx',
            '**/TaskList.tsx',
            '**/TaskRow.tsx',
            '**/TasksCard.tsx',
            '**/TerminalOutput.tsx',
            '**/ThinkingStepsDisplay.tsx',
            '**/TimelineCard.tsx',
            '**/Title.tsx',
            '**/ToolStepRenderer.tsx',
            '**/UserOrMetadataLoader.tsx',
            '**/WorkflowStepActionDrawerDecorator.tsx',
            '**/WorkspaceInviteLink.tsx',
            '**/WorkspaceInviteTeam.tsx',
          ],
          babelOptions: {
            presets: ['@babel/preset-typescript', '@babel/preset-react'],
            plugins: ['@babel/plugin-transform-export-namespace-from'],
          },
        }),
        enforce: 'pre',
      },
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html',
      }) as PluginOption, // https://github.com/btd/rollup-plugin-visualizer/issues/162#issuecomment-1538265997,
    ],

    optimizeDeps: {
      exclude: [
        '../../node_modules/.vite',
        '../../node_modules/.cache',
        '../../node_modules/twenty-ui',
      ],
    },

    build: {
      minify: 'esbuild',
      outDir: 'build',
      sourcemap: VITE_BUILD_SOURCEMAP === 'true',
      rollupOptions: {
        //  Don't use manual chunks as it causes many issue
        // including this one we wasted a lot of time on:
        // https://github.com/rollup/rollup/issues/2793
        output: {
          // Set chunk size warning limit (in bytes) - warns at 1MB
          chunkSizeWarningLimit: CHUNK_SIZE_WARNING_LIMIT,
          // Custom plugin to fail build if chunks exceed max size
          plugins: [
            {
              name: 'chunk-size-limit',
              generateBundle(_options, bundle) {
                const oversizedChunks: string[] = [];

                Object.entries(bundle).forEach(([fileName, chunk]) => {
                  if (chunk.type === 'chunk' && chunk.code !== undefined) {
                    const size = Buffer.byteLength(chunk.code, 'utf8');
                    const isMainChunk =
                      fileName.includes('index') && chunk.isEntry;
                    const sizeLimit = isMainChunk
                      ? MAIN_CHUNK_SIZE_LIMIT
                      : OTHER_CHUNK_SIZE_LIMIT;
                    const limitType = isMainChunk ? 'main' : 'other';

                    if (size > sizeLimit) {
                      oversizedChunks.push(
                        `${fileName} (${limitType}): ${(size / 1024 / 1024).toFixed(2)}MB (limit: ${(sizeLimit / 1024 / 1024).toFixed(2)}MB)`,
                      );
                    }
                  }
                });

                if (oversizedChunks.length > 0) {
                  const errorMessage = `Build failed: The following chunks exceed their size limits:\n${oversizedChunks.map((chunk) => `  - ${chunk}`).join('\n')}`;
                  this.error(errorMessage);
                }
              },
            },
            // TODO; later - think about prefetching modules such
            // as date time picker, phone input etc...
            /*
            {
              name: 'add-prefetched-modules',
              transformIndexHtml(html: string,
                ctx: {
                  path: string;
                  filename: string;
                  server?: ViteDevServer;
                  bundle?: import('rollup').OutputBundle;
                  chunk?: import('rollup').OutputChunk;
                }) {

                  const bundles = Object.keys(ctx.bundle ?? {});

                  let modernBundles = bundles.filter(
                    (bundle) => bundle.endsWith('.map') === false
                  );


                  // Remove existing files and concatenate them into link tags
                  const prefechBundlesString = modernBundles
                    .filter((bundle) => html.includes(bundle) === false)
                    .map((bundle) => `<link rel="prefetch" href="${ctx.server?.config.base}${bundle}">`)
                    .join('');

                  // Use regular expression to get the content within <head> </head>
                  const headContent = html.match(/<head>([\s\S]*)<\/head>/)?.[1] ?? '';
                  // Insert the content of prefetch into the head
                  const newHeadContent = `${headContent}${prefechBundlesString}`;
                  // Replace the original head
                  html = html.replace(
                    /<head>([\s\S]*)<\/head>/,
                    `<head>${newHeadContent}</head>`
                  );

                  return html;


              },
            }*/
          ],
        },
      },
    },

    envPrefix: 'REACT_APP_',

    define: {
      _env_: {
        REACT_APP_SERVER_BASE_URL,
      },
      'process.env': {
        REACT_APP_SERVER_BASE_URL,
        IS_DEBUG_MODE,
        IS_DEV_ENV: mode === 'development' ? 'true' : 'false',
      },
    },
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
    resolve: {
      alias: {
        path: 'rollup-plugin-node-polyfills/polyfills/path',
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
      },
    },
  };
});
