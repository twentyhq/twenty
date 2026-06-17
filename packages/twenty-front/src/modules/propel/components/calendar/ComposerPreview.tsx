/* oxlint-disable twenty/no-hardcoded-colors -- the avatar icon is white-on-brand
   (the platform's brand color comes from CHANNEL_META); white has no theme token
   and is the correct foreground on every network's colored avatar. */
import { type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CHANNEL_META } from '@/propel/lib/socialCalendarConfig';
import { type ComposerMedia } from '@/propel/lib/socialComposer';
import { StyledPreviewCard } from '@/propel/components/calendar/composerStyles';
import { type SocialNetwork } from '@/propel/types/socialCalendar';

// Live per-channel preview (§11 RIGHT pane). Renders the composing post roughly as
// it appears on the selected network: page avatar, media framed to the network's
// aspect (IG square, FB/LinkedIn landscape, TikTok portrait), and the caption with
// the network's truncation ("… more"). It's a faithful-enough mock — not a pixel
// clone — so the agent sees the shape of the post before it ships.

// Caption truncation lengths per network (the "see more" fold, not the hard char
// limit). Tuned to where each network visually folds a feed caption.
const PREVIEW_FOLD: Record<SocialNetwork, number> = {
  FACEBOOK: 280,
  INSTAGRAM: 125,
  LINKEDIN: 210,
  TIKTOK: 150,
};

const MEDIA_RATIO: Record<SocialNetwork, 'square' | 'landscape' | 'portrait'> = {
  INSTAGRAM: 'square',
  FACEBOOK: 'landscape',
  LINKEDIN: 'landscape',
  TIKTOK: 'portrait',
};

// A short handle for the avatar/header from the network. We don't have the real
// connected page name in this payload, so we use the network label as the handle
// (honest: it's a per-network preview, not a claim about the exact page).
const PreviewCaption = ({
  body,
  network,
}: {
  body: string;
  network: SocialNetwork;
}) => {
  const text = body.trimEnd();
  if (text === '') {
    return (
      <div className="propel-preview-caption">
        <span className="propel-preview-empty-caption">
          Your caption will appear here…
        </span>
      </div>
    );
  }
  const fold = PREVIEW_FOLD[network];
  const chars = [...text];
  if (chars.length <= fold) {
    return <div className="propel-preview-caption">{text}</div>;
  }
  const shown = chars.slice(0, fold).join('').trimEnd();
  return (
    <div className="propel-preview-caption">
      {shown}
      <span className="propel-preview-more">… more</span>
    </div>
  );
};

const PreviewMedia = ({
  media,
  network,
}: {
  media: ComposerMedia[];
  network: SocialNetwork;
}) => {
  const ratio = MEDIA_RATIO[network];
  // First renderable item (ready or uploading-with-preview) drives the frame.
  const first = media.find(
    (m) => m.url !== null || m.objectUrl !== null,
  );
  const src = first?.objectUrl ?? first?.url ?? null;

  if (src === null) {
    return (
      <div
        className="propel-preview-media propel-preview-media--empty"
        data-ratio={ratio}
      >
        {network === 'INSTAGRAM' ? 'Instagram needs an image' : 'No media'}
      </div>
    );
  }
  return (
    <div className="propel-preview-media" data-ratio={ratio}>
      {first?.kind === 'video' ? (
        <video src={src} muted preload="metadata" />
      ) : (
        <img src={src} alt="" />
      )}
    </div>
  );
};

const PreviewBody = ({
  network,
  body,
  media,
}: {
  network: SocialNetwork;
  body: string;
  media: ComposerMedia[];
}) => {
  const meta = CHANNEL_META[network];
  const Icon = meta.Icon;
  return (
    <StyledPreviewCard>
      <div className="propel-preview-head">
        <div
          className="propel-preview-avatar"
          style={{ ['--avatar-color' as string]: meta.color }}
        >
          <Icon size={18} style={{ color: '#fff' }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="propel-preview-handle">RE/MAX Hub</div>
          <div className="propel-preview-sub">{meta.label} · just now</div>
        </div>
      </div>
      <PreviewMedia media={media} network={network} />
      <PreviewCaption body={body} network={network} />
    </StyledPreviewCard>
  );
};

// Crossfade the card when the active preview channel switches (§15: 2px blur masks
// the differing FB↔IG layouts). transform-origin handled by the parent tab.
const CardFade = ({
  network,
  reduce,
  children,
}: {
  network: SocialNetwork;
  reduce: boolean;
  children: ReactNode;
}) => (
  <AnimatePresence mode="wait" initial={false}>
    <motion.div
      key={network}
      initial={reduce ? { opacity: 0 } : { opacity: 0, filter: 'blur(2px)' }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, filter: 'blur(0px)' }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, filter: 'blur(2px)' }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

export const ComposerPreview = ({
  activeNetwork,
  body,
  media,
}: {
  /** the channel currently shown in the preview; null = no channel selected */
  activeNetwork: SocialNetwork | null;
  body: string;
  media: ComposerMedia[];
}) => {
  const reduce = useReducedMotion() ?? false;

  if (activeNetwork === null) {
    return (
      <StyledPreviewCard>
        <div
          className="propel-preview-media propel-preview-media--empty"
          data-ratio="landscape"
        >
          Pick a channel to preview the post
        </div>
      </StyledPreviewCard>
    );
  }

  return (
    <CardFade network={activeNetwork} reduce={reduce}>
      <PreviewBody network={activeNetwork} body={body} media={media} />
    </CardFade>
  );
};
