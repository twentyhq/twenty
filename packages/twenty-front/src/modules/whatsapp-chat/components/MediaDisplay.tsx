import styled from '@emotion/styled';
import { useState } from 'react';

import { WHATSAPP_BRIDGE_URL } from '@/whatsapp-chat/constants/WhatsAppBridgeUrl';

const StyledImage = styled.img`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  max-height: 300px;
  max-width: 100%;
  object-fit: contain;
`;

const StyledVideo = styled.video`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  max-height: 300px;
  max-width: 100%;
`;

const StyledAudio = styled.audio`
  max-width: 100%;
  width: 240px;
`;

const StyledDocument = styled.a`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledImageOverlay = styled.div`
  align-items: center;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
`;

const StyledFullImage = styled.img`
  max-height: 90vh;
  max-width: 90vw;
  object-fit: contain;
`;

const resolveMediaUrl = (mediaUrl: string): string => {
  // Blob URLs (optimistic messages) — use directly
  if (mediaUrl.startsWith('blob:')) {
    return mediaUrl;
  }

  // Rewrite WAHA internal URLs (http://localhost:3000/api/files/{session}/{hash})
  // to go through the bridge media proxy (/api/wa/media/{session}/{hash})
  const wahaMatch = mediaUrl.match(
    /^https?:\/\/[^/]+\/api\/files\/(.+)$/,
  );
  if (wahaMatch) {
    return `${WHATSAPP_BRIDGE_URL}/media/${wahaMatch[1]}`;
  }

  if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
    return mediaUrl;
  }

  if (mediaUrl.startsWith('/')) {
    return `${WHATSAPP_BRIDGE_URL}${mediaUrl}`;
  }

  return `${WHATSAPP_BRIDGE_URL}/media/${mediaUrl}`;
};

type MediaDisplayProps = {
  mediaUrl: string;
  mediaMimetype?: string;
  body?: string;
};

export const MediaDisplay = ({
  mediaUrl,
  mediaMimetype,
  body,
}: MediaDisplayProps) => {
  const [showFullImage, setShowFullImage] = useState(false);
  const resolvedUrl = resolveMediaUrl(mediaUrl);

  if (mediaMimetype?.startsWith('image/')) {
    return (
      <>
        <StyledImage
          src={resolvedUrl}
          alt={body || 'Image'}
          onClick={() => setShowFullImage(true)}
          loading="lazy"
        />
        {showFullImage && (
          <StyledImageOverlay onClick={() => setShowFullImage(false)}>
            <StyledFullImage src={resolvedUrl} alt={body || 'Image'} />
          </StyledImageOverlay>
        )}
      </>
    );
  }

  if (mediaMimetype?.startsWith('video/')) {
    return <StyledVideo src={resolvedUrl} controls preload="metadata" />;
  }

  if (mediaMimetype?.startsWith('audio/')) {
    return <StyledAudio src={resolvedUrl} controls preload="metadata" />;
  }

  return (
    <StyledDocument href={resolvedUrl} target="_blank" rel="noopener noreferrer">
      {body || 'Document'}
    </StyledDocument>
  );
};
