import CustomLogo from '@/applications/assets/custom-logo.webp';

export const getCustomApplicationLogoUrl = () =>
  new URL(CustomLogo, window.location.href).toString();
