import { defineFrontComponent, getPublicAssetUrl } from 'twenty-sdk/define';

import {
  APP_DISPLAY_NAME,
  MAIN_PAGE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const MainPage = () => {
  const logoUrl = getPublicAssetUrl('logo.svg');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        fontFamily: 'sans-serif',
        gap: '16px',
      }}
    >
      <img
        src={logoUrl}
        alt={`${APP_DISPLAY_NAME} logo`}
        style={{ width: '80px', height: '80px' }}
      />
      <span
        style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#333',
        }}
      >
        {APP_DISPLAY_NAME}
      </span>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: MAIN_PAGE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: APP_DISPLAY_NAME,
  description: `${APP_DISPLAY_NAME} front component displaying the app logo and name`,
  component: MainPage,
});
