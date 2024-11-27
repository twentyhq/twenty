# Docs: https://devenv.sh/basics/
{ pkgs, latest, ... }: {

  languages = {
    # Docs: https://devenv.sh/languages/
    nix.enable = true;
    javascript = {
      enable = true; # source: https://github.com/cachix/devenv/blob/main/src/modules/languages/javascript.nix
      # remove whichever you don't need
      npm.enable = true;
      pnpm = {
        enable = true;
        package = latest.nodePackages.pnpm;
      };
      yarn.enable = true;
    };
    typescript.enable = true;
    deno.enable = true;
  };

  packages = with pkgs; [
    # Search for packages: https://search.nixos.org/packages?channel=unstable&query=cowsay
    # (note: this searches on unstable channel, be aware your nixpkgs flake input might be on a release channel)

    gcc # needed for some npm packages
    nodePackages.typescript-language-server # many editors benefit from this
  ];

  scripts = {
    # Docs: https://devenv.sh/scripts/
    # dev.exec = ''pnpm dev'';
  };

  difftastic.enable = true; # https://devenv.sh/integrations/difftastic/

  pre-commit.hooks = {
    # Docs: https://devenv.sh/pre-commit-hooks/
    # available pre-configured hooks: https://devenv.sh/reference/options/#pre-commithooks
    # adding hooks which are not included: https://github.com/cachix/pre-commit-hooks.nix/issues/31

    nil.enable = true; # nix check
    nixpkgs-fmt.enable = true; # nix formatting
    eslint = {
      # enable = true; # disabled by default as it fails if no eslint config exists
      files = "\.(js|ts|vue|jsx|tsx)$";
      fail_fast = true; # skip other pre-commit hooks if this one fails
    };
  };
}
