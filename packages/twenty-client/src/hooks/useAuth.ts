export const useAuth = () => {
  // ...existing code...

  const loginWithGitHub = () => {
    window.location.href = '/auth/github'; // Redirect to GitHub login
  };

  return {
    // ...existing code...
    loginWithGitHub,
  };
};