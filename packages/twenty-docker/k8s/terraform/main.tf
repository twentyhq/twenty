#############
# Providers #
#############
provider "kubernetes" {
  config_path = "~/.kube/config"
}

####################
# Terraform Config #
####################
terraform {
  required_version = ">= 1.9.2"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.32.0"
    }
    random = {
      source  = "hashicorp/random"
      version = ">= 3.6.3"
    }
  }
}
