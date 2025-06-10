import { isDefined } from 'twenty-shared/utils';
const btn = document.getElementById('twenty-settings-btn');
if (!isDefined(btn)) {
  const div = document.createElement('div');
  const img = document.createElement('img');
  img.src =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAA7EAAAOxAGVKw4bAAACb0lEQVR4nO2VO4taQRTHr3AblbjxEVlwCwVhg7BoqqCIjy/gAyyFWNlYBOxsfH0KuxgQGwXRUkGuL2S7i1barGAgiwbdW93SnGOc4BonPiKahf3DwXFmuP/fPM4ZlvmlTxAhCBdzHnEQWYiv7Mr4C3NeuVYhQYDPzOUUQgDLBQGcLHNhvQK8DACPx8PTxiqVyvISG43GbyaT6Qfpn06n0m63e/tPAPF4vJ1MJu8kEsnWTCkWi1yr1RKGw+GDRqPBOTfr44vFQvD7/Q/lcpmaaVQAr9fLp1IpO22c47hGOBz+MB6PH+Vy+VYDAL8qlUoGtVotzOfzq4MAgsHgE/6KojiQyWR/bKVSqbSszHFM8Pl8z1YK48JsNltCOBwOnrYLO+8AAIjb+nHbycoTiUQfDJ7tFq4YAHiVSmXBxcD41u8flQU8z7fhzO0r83atVns3Go3u9Xr9x0O/RQXo9/tsIBBg6vX606a52Wz+bZ7P5/WwG29gxSJzhKgA6XTaDoFNF+krFAocmC//4yWEcSf2wTm7mCO19xFgSsKOLI16vV7b7XY7mRNoLwA0JymJ5uQIzgIAuX5PzDElT2m+E8BqtQ4ymcx7Yq7T6a6ZE4sKgOadTucaCwkxp1UzlEKh0GDxIXOwDWHAdi6Xe3swQDQa/Q7mywoolUpvsaptymazDWKxmBHTlWXZm405BFZoNpuGgwEmk4mE2SGtVivii4f1AO7J3ZopkQCQj7Ar1FeRChCJRJzVapX6DKNIfSc1Ax+wtQWQ55h6bH8FWDfYV4fO3wlwDr0C/BcADYiTPCxHqIEA2QsCZAkAKnRGkMbKN/sTX5YHPQ1e7SkAAAAASUVORK5CYII=';
  img.height = 20;
  img.width = 20;
  img.alt = 'Twenty logo';

  // Write universal styles for the button
  const divStyles = {
    border: '1px solid black',
    borderRadius: '50%',
    backgroundColor: 'black',
    color: 'white',
    fontWeight: '600',
    fontSize: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    justifyContent: 'center',
    padding: '0 1rem',
    cursor: 'pointer',
    height: '50px',
    width: '50px',
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    zIndex: '9999999999999999999999999',
  };

  div.addEventListener('mouseenter', () => {
    const hoverStyles = {
      //eslint-disable-next-line @nx/workspace-no-hardcoded-colors
      backgroundColor: '#5e5e5e',
      //eslint-disable-next-line @nx/workspace-no-hardcoded-colors
      borderColor: '#5e5e5e',
    };
    Object.assign(div.style, hoverStyles);
  });

  div.addEventListener('mouseleave', () => {
    Object.assign(div.style, divStyles);
  });

  div.onclick = async () => {
    chrome.runtime.sendMessage({ action: 'openSidepanel' });
    chrome.storage.local.set({ navigateSidepanel: 'settings' });
  };

  div.appendChild(img);

  Object.assign(div.style, divStyles);

  document.body.appendChild(div);
}
