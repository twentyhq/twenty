import { Box } from '@mantine/core';
import { useContext } from 'react';
import { EmbedSignDocument } from '@documenso/embed-react';
import { ThemeContext } from 'twenty-ui/theme-constants';

// Wraps Documenso's `@documenso/embed-react` signing view (verified API, v0.6.2:
// `EmbedSignDocument` takes a recipient `token` + optional `host`, and fires
// `onDocumentReady` / `onDocumentCompleted({ token, documentId, recipientId })` /
// `onDocumentError(error)`). We point `host` at the self-hosted
// `sign.postbuild.ae` so the iframe loads OUR Documenso, and forward only the
// recipient *token* (create-draft extracts it server-side from the signing URL —
// the hero never parses URLs).
//
// This is a REAL frontend component (not the front-component sandbox), so it CAN
// host an external iframe and undeclared attributes survive — the whole reason
// D2 graduates the A2A flow out of the box.
//
// CSP NOTE (engine, not a blocker here): the engine image's reverse-proxy / CSP
// layer must allow `https://sign.postbuild.ae` in `frame-src`, and the
// self-hosted Documenso must permit the CRM origin in its `/embed/*`
// `frame-ancestors`. Verified live in-browser on staging (plan §8a); no
// source-level CSP exists in the fork today.

const DOCUMENSO_HOST = 'https://sign.postbuild.ae';

export const DocumensoEmbed = ({
  token,
  signerName,
  signerEmail,
  onReady,
  onCompleted,
  onError,
}: {
  /** OUR recipient's signing token, from create-draft. */
  token: string;
  signerName?: string;
  signerEmail?: string;
  onReady?: () => void;
  onCompleted: () => void;
  onError?: (error: string) => void;
}) => {
  const { colorScheme } = useContext(ThemeContext);

  const hasName = signerName !== undefined && signerName !== '';
  const hasEmail = signerEmail !== undefined && signerEmail !== '';

  return (
    <Box
      style={{
        width: '100%',
        // Tall enough to show a full A2A page + the sign affordance without an
        // inner scroll fight; the embed manages its own internal scroll.
        height: 'min(72vh, 900px)',
        minHeight: 480,
        border: '1px solid var(--mantine-color-default-border)',
        borderRadius: 'var(--mantine-radius-md)',
        overflow: 'hidden',
        background: 'var(--mantine-color-body)',
      }}
    >
      <EmbedSignDocument
        token={token}
        host={DOCUMENSO_HOST}
        className="propel-a2a-embed"
        // Pre-fill + lock our identity so the agent can't accidentally rename the
        // signer; both are optional and only applied (+locked) when known.
        name={hasName ? signerName : undefined}
        lockName={hasName ? true : undefined}
        email={hasEmail ? signerEmail : undefined}
        lockEmail={hasEmail ? true : undefined}
        // Follow Twenty's scheme: Documenso defaults to dark-capable, so only
        // disable dark mode when the CRM is in light mode.
        darkModeDisabled={colorScheme !== 'dark'}
        onDocumentReady={onReady}
        onDocumentCompleted={() => onCompleted()}
        onDocumentError={(error) => onError?.(error)}
      />
    </Box>
  );
};
